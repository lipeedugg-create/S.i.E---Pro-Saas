import { GoogleGenAI } from "@google/genai";
import { query } from '../config/db.js';

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ID do plugin Raio-X Administrativo (Fixo na migração)
const PLUGIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99';

// Prompt Padrão de Fallback
const DEFAULT_SYSTEM_PROMPT = `
    Você é o SISTEMA SIE (Strategic Intelligence Enterprise).
    Sua tarefa é gerar um relatório de transparência pública sobre a administração de uma cidade brasileira.
    Busque dados reais e atualizados na web.
`;

const DEFAULT_NEGATIVE_PROMPT = `
    - Não invente nomes de pessoas.
    - Se não encontrar uma informação específica, deixe o campo como "Não identificado" ou array vazio, não invente.
    - Não use markdown no JSON de resposta.
`;

const getPluginConfig = async () => {
    try {
        const res = await query('SELECT config FROM plugins WHERE id = $1', [PLUGIN_ID]);
        if (res.rows.length > 0 && res.rows[0].config) {
            return res.rows[0].config;
        }
    } catch (e) {
        console.warn("Falha ao carregar config do plugin do DB, usando padrão.", e);
    }
    return {};
};

// Função de validação manual do Schema
const validateSchema = (data) => {
    const errors = [];
    if (!data) throw new Error("Resposta da IA vazia.");
    if (!data.city) errors.push("Campo 'city' ausente.");
    // Flexibiliza o 'mayor.name' para permitir que a IA diga "Não encontrado" sem quebrar a app
    if (!data.mayor) errors.push("Objeto 'mayor' ausente.");
    if (!Array.isArray(data.councilors)) errors.push("Campo 'councilors' deve ser um array.");
    if (!Array.isArray(data.key_servants)) errors.push("Campo 'key_servants' deve ser um array.");
    
    if (errors.length > 0) {
        throw new Error(`Validação de Schema falhou: ${errors.join(', ')}`);
    }
    return true;
};

export const searchCityAdmin = async (city) => {
    if (!ai) {
        throw new Error("Serviço de IA indisponível (API Key não configurada).");
    }

    try {
        // 1. Carrega configuração dinâmica do banco
        const config = await getPluginConfig();
        const systemPromptDB = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
        const negativePromptDB = config.negativePrompt || DEFAULT_NEGATIVE_PROMPT;

        // 2. Monta a System Instruction (Autoridade Máxima)
        const combinedSystemInstruction = `
            ${systemPromptDB}
            
            REGRAS RESTRITIVAS (NEGATIVE PROMPT):
            ${negativePromptDB}
        `;

        // 3. Prompt Reforçado para JSON
        const userPrompt = `
            Pesquise dados oficiais atualizados e gere o relatório administrativo para a cidade de: ${city} (Brasil).
            
            FORMATO OBRIGATÓRIO DE RESPOSTA (JSON PURO):
            {
                "city": "Nome da Cidade",
                "last_updated": "Data de hoje",
                "mayor": { "name": "Nome", "role": "Prefeito", "party": "Partido", "past_roles": ["Ex-Cargo 1"] },
                "vice_mayor": { "name": "Nome", "role": "Vice-Prefeito", "party": "Partido" },
                "councilors": [ { "name": "Nome", "role": "Vereador", "party": "Partido" } ],
                "key_servants": [ { "name": "Nome", "department": "Secretaria", "role_type": "Comissionado/Efetivo", "estimated_salary": "R$ Valor" } ]
            }
            
            IMPORTANTE: Retorne APENAS o JSON válido. Não use blocos de código markdown (\`\`\`json). Apenas o objeto { ... }.
        `;

        // 4. Executa a geração com Search Grounding
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: combinedSystemInstruction,
                temperature: 0.1, // Baixa temperatura para precisão factual
                tools: [{ googleSearch: {} }] // Força uso de dados reais da web
            }
        });

        // 5. Processamento e Limpeza da Resposta
        let textResponse = response.text || "{}";
        
        // Remove Markdown agressivamente
        textResponse = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/^```\s*/, '');

        let data;
        try {
            data = JSON.parse(textResponse.trim());
        } catch (e) {
            console.error("Erro ao parsear JSON da IA:", textResponse);
            throw new Error("A IA gerou uma resposta inválida que não pôde ser processada pelo sistema.");
        }

        // 6. Validação Rigorosa
        validateSchema(data);

        // Validação Lógica de Dados Vazios (Alucinação negativa)
        if (data.mayor && (data.mayor.name === "Não identificado" || data.mayor.name === "Nome")) {
             console.warn(`Alerta de baixa confiança para cidade: ${city}`);
        }
        
        // Cálculo de custo
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
        const cost = (usage.promptTokenCount / 1000000 * 0.10) + (usage.candidatesTokenCount / 1000000 * 0.30);

        return { data, cost, tokens: { in: usage.promptTokenCount, out: usage.candidatesTokenCount } };

    } catch (error) {
        console.error("AI Search Error:", error);
        // Repassa a mensagem de erro para o frontend
        throw new Error(error.message || "Falha na inteligência governamental.");
    }
};