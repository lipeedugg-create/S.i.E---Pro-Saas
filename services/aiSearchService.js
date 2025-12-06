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
`;

const DEFAULT_NEGATIVE_PROMPT = `
    - Não use markdown no JSON.
    - Não invente dados (alucinação) se não tiver certeza, use estimativas claras.
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

export const searchCityAdmin = async (city) => {
    if (!ai) {
        throw new Error("Serviço de IA indisponível (API Key não configurada).");
    }

    try {
        // 1. Carrega configuração dinâmica do banco
        const config = await getPluginConfig();
        const systemPrompt = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
        const negativePrompt = config.negativePrompt || DEFAULT_NEGATIVE_PROMPT;

        const prompt = `
            ${systemPrompt}
            
            CIDADE ALVO: ${city} (Brasil).

            DADOS NECESSÁRIOS (ESTRUTURA):
            1. Prefeito Atual (Nome, Partido, Cargos Anteriores na carreira)
            2. Vice-Prefeito (Nome, Partido)
            3. Vereadores (Liste pelo menos 5 principais ou mesa diretora, com seus partidos e, se possível, cargos anteriores)
            4. Funcionários Públicos Chave (Secretários Municipais ex: Saúde, Educação, Obras). Inclua Nome, Lotação (Secretaria), Vínculo (Comissionado/Efetivo) e Salário Estimado (baseado na média de mercado para o porte da cidade ou dados públicos conhecidos).

            FORMATO DE RESPOSTA (JSON OBRIGATÓRIO E EXATO):
            {
                "city": "${city}",
                "mayor": { "name": "...", "role": "Prefeito", "party": "...", "past_roles": ["..."] },
                "vice_mayor": { "name": "...", "role": "Vice-Prefeito", "party": "...", "past_roles": [] },
                "councilors": [
                    { "name": "...", "role": "Vereador", "party": "...", "past_roles": ["..."] }
                ],
                "key_servants": [
                    { "name": "...", "department": "Secretaria de X", "role_type": "Comissionado", "estimated_salary": "R$ X.XXX,XX" }
                ],
                "last_updated": "Data atual"
            }
            
            RESTRIÇÕES DE RESPOSTA:
            ${negativePrompt}
            - Responda APENAS o JSON. 
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.1 // Temperatura mínima para reduzir alucinações
            }
        });

        // Tratamento robusto para remover Markdown caso o modelo inclua
        let textResponse = response.text;
        if (textResponse.includes('```json')) {
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');
        } else if (textResponse.includes('```')) {
            textResponse = textResponse.replace(/```/g, '');
        }

        const data = JSON.parse(textResponse.trim());
        
        // Cálculo de custo aproximado
        const usage = response.usageMetadata;
        const cost = (usage.promptTokenCount / 1000000 * 0.10) + (usage.candidatesTokenCount / 1000000 * 0.30);

        return { data, cost, tokens: { in: usage.promptTokenCount, out: usage.candidatesTokenCount } };

    } catch (error) {
        console.error("AI Search Error:", error);
        throw new Error("Falha ao processar inteligência governamental. Tente novamente.");
    }
};