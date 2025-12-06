import { GoogleGenAI } from "@google/genai";
import { query } from '../config/db.js';

// Inicializa Gemini
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const COST_INPUT_PER_1K_USD = 0.000125;
const COST_OUTPUT_PER_1K_USD = 0.000375;

// Helper simples para extrair texto de HTML (Substituto leve para cheerio/puppeteer)
const extractTextFromHtml = (html) => {
    // Remove scripts e estilos
    let text = html.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "");
    text = text.replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, "");
    // Remove tags HTML
    text = text.replace(/<[^>]+>/g, "\n");
    // Remove linhas vazias excessivas e trim
    text = text.replace(/\n\s*\n/g, "\n").trim();
    // Limita tamanho para não estourar tokens (aprox 15k caracteres)
    return text.substring(0, 15000);
};

// Helper para fazer fetch com timeout
const fetchWithTimeout = async (url, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

async function analyzeWithGemini(text, keywords) {
    if (!ai) return mockAnalysis(text);

    try {
        const prompt = `
            Analise o seguinte texto extraído de uma página web.
            Contexto/Palavras-chave de interesse: ${keywords.join(', ')}.

            Retorne APENAS um JSON com este formato:
            {
                "sentiment": "Positivo, Negativo ou Neutro",
                "impact": "Alto, Médio ou Baixo (relevância para as palavras-chave)",
                "summary": "Resumo de 1 frase focado nas palavras-chave",
                "keywords": ["Lista das palavras-chave encontradas no texto"]
            }

            Texto para análise:
            ${text}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const data = JSON.parse(response.text);
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
        
        const cost = (usage.promptTokenCount / 1000 * COST_INPUT_PER_1K_USD) + 
                     (usage.candidatesTokenCount / 1000 * COST_OUTPUT_PER_1K_USD);

        return {
            result: data,
            metrics: {
                tokens_in: usage.promptTokenCount,
                tokens_out: usage.candidatesTokenCount,
                cost: cost
            }
        };
    } catch (e) {
        console.error("Gemini Error:", e);
        // Em caso de erro de parse ou API, retorna estrutura vazia segura
        return {
            result: { sentiment: "Erro", impact: "N/A", summary: "Falha na análise IA", keywords: [] },
            metrics: { tokens_in: 0, tokens_out: 0, cost: 0 }
        };
    }
}

function mockAnalysis(text) {
    return {
        result: {
            sentiment: "Neutro (Simulado)",
            impact: "Baixo",
            summary: "Análise simulada (Sem API Key)",
            keywords: ["Simulação"]
        },
        metrics: { tokens_in: 0, tokens_out: 0, cost: 0 }
    };
}

/**
 * Executa o ciclo de monitoramento.
 * @param {string|null} specificUserId - Se fornecido, roda apenas para este usuário.
 */
export const runMonitoringCycle = async (specificUserId = null) => {
    console.log(`Starting Monitoring Cycle... ${specificUserId ? `(Target User: ${specificUserId})` : '(Global)'}`);
    
    // 1. Construção dinâmica da query
    let sql = `
        SELECT c.* 
        FROM monitoring_configs c
        JOIN subscriptions s ON c.user_id = s.user_id
        WHERE c.is_active = true AND s.status = 'active'
    `;
    
    const params = [];
    if (specificUserId) {
        sql += ` AND c.user_id = $1`;
        params.push(specificUserId);
    }

    const configs = await query(sql, params);
    let processedCount = 0;

    for (const config of configs.rows) {
        // Se não tiver URLs, pula
        if (!config.urls_to_track || config.urls_to_track.length === 0) continue;

        let userHasUpdates = false;

        for (const url of config.urls_to_track) {
            try {
                console.log(`Crawling ${url} for user ${config.user_id}...`);
                
                // 1. Crawler Real
                const res = await fetchWithTimeout(url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                
                const html = await res.text();
                const content = extractTextFromHtml(html);

                if (content.length < 50) {
                    console.warn(`Conteúdo insuficiente em ${url}`);
                    continue;
                }

                // 2. Análise IA
                const { result, metrics } = await analyzeWithGemini(content, config.keywords || []);

                // 3. Persistir Resultado
                await query(
                    `INSERT INTO master_items (user_id, source_url, analyzed_content, ai_summary, detected_keywords)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        config.user_id, 
                        url, 
                        content.substring(0, 500) + "...", // Salva apenas o início para economizar DB
                        result.summary, 
                        JSON.stringify(result.keywords)
                    ]
                );

                // 4. Log de Auditoria
                await query(
                    `INSERT INTO requests_log (user_id, endpoint, request_tokens, response_tokens, cost_usd, status)
                     VALUES ($1, $2, $3, $4, $5, 'SUCCESS')`,
                    [config.user_id, 'GEMINI_CRAWLER', metrics.tokens_in, metrics.tokens_out, metrics.cost]
                );
                
                userHasUpdates = true;
                processedCount++;

            } catch (err) {
                console.error(`Erro processando ${url}:`, err.message);
                 await query(
                    `INSERT INTO requests_log (user_id, endpoint, cost_usd, status)
                     VALUES ($1, 'CRAWLER_ERROR', 0, 'FAILED')`,
                    [config.user_id]
                );
            }
        }

        // 5. Atualiza o Timestamp da última execução para o usuário
        if (userHasUpdates || specificUserId) { // Se for execução manual, atualiza mesmo se falhar URLs
            await query('UPDATE monitoring_configs SET last_run_at = CURRENT_TIMESTAMP WHERE user_id = $1', [config.user_id]);
        }
    }
    console.log(`Cycle finished. Processed ${processedCount} items.`);
    return processedCount;
};