import { GoogleGenAI } from "@google/genai";
import { query } from '../config/db.js';
import { logRequest } from './logService.js';

// Inicializa Gemini
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const COST_INPUT_PER_1K_USD = 0.000125;
const COST_OUTPUT_PER_1K_USD = 0.000375;

// Helper simples para extrair texto de HTML
const extractTextFromHtml = (html) => {
    let text = html.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "");
    text = text.replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, "");
    text = text.replace(/<[^>]+>/g, "\n");
    text = text.replace(/\n\s*\n/g, "\n").trim();
    return text.substring(0, 15000);
};

// Helper para fazer fetch com timeout e HEADERS DE NAVEGADOR (Anti-Block)
const fetchWithTimeout = async (url, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { 
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
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

export const runMonitoringCycle = async (specificUserId = null) => {
    const isManualRun = !!specificUserId;
    console.log(`Starting Monitoring Cycle... ${isManualRun ? `(Manual: ${specificUserId})` : '(Auto/Global)'}`);
    
    let sql = `
        SELECT c.* 
        FROM monitoring_configs c
        JOIN subscriptions s ON c.user_id = s.user_id
        WHERE c.is_active = true AND s.status = 'active'
    `;
    
    const params = [];

    if (isManualRun) {
        sql += ` AND c.user_id = $1`;
        params.push(specificUserId);
    } else {
        sql += `
            AND (
                c.last_run_at IS NULL
                OR (c.frequency = 'hourly' AND c.last_run_at < NOW() - INTERVAL '1 hour')
                OR (c.frequency = 'daily' AND c.last_run_at < NOW() - INTERVAL '24 hours')
            )
        `;
    }

    const configs = await query(sql, params);
    
    if (!isManualRun && configs.rows.length === 0) {
        return 0;
    }

    let processedCount = 0;

    for (const config of configs.rows) {
        if (!config.urls_to_track || config.urls_to_track.length === 0) continue;

        for (const url of config.urls_to_track) {
            try {
                console.log(`Crawling ${url} for user ${config.user_id}...`);
                
                const res = await fetchWithTimeout(url);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                
                const html = await res.text();
                const content = extractTextFromHtml(html);

                if (content.length < 50) continue;

                const { result, metrics } = await analyzeWithGemini(content, config.keywords || []);

                await query(
                    `INSERT INTO master_items (user_id, source_url, analyzed_content, ai_summary, detected_keywords)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        config.user_id, 
                        url, 
                        content.substring(0, 500) + "...", 
                        result.summary, 
                        JSON.stringify(result.keywords)
                    ]
                );

                // LOG CENTRALIZADO
                await logRequest({
                    userId: config.user_id,
                    endpoint: 'GEMINI_CRAWLER',
                    tokensIn: metrics.tokens_in,
                    tokensOut: metrics.tokens_out,
                    cost: metrics.cost,
                    status: 'SUCCESS'
                });
                
                processedCount++;

            } catch (err) {
                console.error(`Erro processando ${url}:`, err.message);
                await logRequest({
                    userId: config.user_id,
                    endpoint: 'CRAWLER_ERROR',
                    cost: 0,
                    status: 'FAILED'
                });
            }
        }
        await query('UPDATE monitoring_configs SET last_run_at = CURRENT_TIMESTAMP WHERE user_id = $1', [config.user_id]);
    }

    return processedCount;
};