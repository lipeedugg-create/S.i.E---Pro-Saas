import { GoogleGenAI } from "@google/genai";
import { query } from '../config/db.js';

// Inicializa Gemini
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const COST_INPUT_PER_1K_USD = 0.000125;
const COST_OUTPUT_PER_1K_USD = 0.000375;

// Função Auxiliar de Análise
async function analyzeWithGemini(text) {
    if (!ai) return mockAnalysis(text);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: text,
            config: {
                systemInstruction: "Analise o texto. Retorne JSON: { sentiment, impact, summary, keywords[] }.",
                responseMimeType: 'application/json'
            }
        });

        const data = JSON.parse(response.text);
        const usage = response.usageMetadata;
        
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
        return mockAnalysis(text);
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

export const runMonitoringCycle = async () => {
    console.log("Starting Monitoring Cycle...");
    
    // 1. Buscar configs ativas de usuários com assinatura válida
    const configs = await query(`
        SELECT c.* 
        FROM monitoring_configs c
        JOIN subscriptions s ON c.user_id = s.user_id
        WHERE c.is_active = true AND s.status = 'active'
    `);

    for (const config of configs.rows) {
        try {
            // Simula Crawler (Aqui entraria Puppeteer/Cheerio)
            const content = `Notícia simulada sobre ${config.keywords[0]}... O mercado reage bem.`;

            // Análise IA
            const { result, metrics } = await analyzeWithGemini(content);

            // Persistir Resultado
            await query(
                `INSERT INTO master_items (user_id, source_url, analyzed_content, ai_summary, detected_keywords)
                 VALUES ($1, $2, $3, $4, $5)`,
                [config.user_id, config.urls_to_track[0] || 'http://source.com', content, result.summary, JSON.stringify(result.keywords)]
            );

            // Log de Auditoria
            await query(
                `INSERT INTO requests_log (user_id, endpoint, request_tokens, response_tokens, cost_usd, status)
                 VALUES ($1, $2, $3, $4, $5, 'SUCCESS')`,
                [config.user_id, 'GEMINI_ANALYSIS', metrics.tokens_in, metrics.tokens_out, metrics.cost]
            );

        } catch (err) {
            console.error(`Erro user ${config.user_id}`, err);
             await query(
                `INSERT INTO requests_log (user_id, endpoint, cost_usd, status)
                 VALUES ($1, 'ERROR', 0, 'FAILED')`,
                [config.user_id]
            );
        }
    }
};
