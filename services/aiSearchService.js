import { GoogleGenAI, Type } from "@google/genai";
import { query } from '../config/db.js';

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ID do plugin Raio-X Administrativo (Fixo na migração)
const PLUGIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99';

// Prompt Padrão de Fallback
const DEFAULT_SYSTEM_PROMPT = `
    Você é o SISTEMA SIE (Strategic Intelligence Enterprise).
    Sua tarefa é gerar um relatório de transparência pública sobre a administração de uma cidade brasileira.
    Busque dados reais e atualizados.
`;

const DEFAULT_NEGATIVE_PROMPT = `
    - Não invente nomes de pessoas.
    - Se não encontrar uma informação específica, deixe o campo como "Não identificado" ou array vazio, não invente.
    - Não use markdown no JSON.
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
        const systemPromptDB = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
        const negativePromptDB = config.negativePrompt || DEFAULT_NEGATIVE_PROMPT;

        // 2. Monta a System Instruction (Autoridade Máxima)
        const combinedSystemInstruction = `
            ${systemPromptDB}
            
            REGRAS RESTRITIVAS (NEGATIVE PROMPT):
            ${negativePromptDB}
        `;

        // 3. Define o Schema Rígido (O modelo NÃO pode fugir dessa estrutura)
        const outputSchema = {
            type: Type.OBJECT,
            properties: {
                city: { type: Type.STRING, description: "Nome da cidade pesquisada" },
                last_updated: { type: Type.STRING, description: "Data da informação (hoje)" },
                mayor: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        party: { type: Type.STRING },
                        past_roles: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "party"]
                },
                vice_mayor: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        party: { type: Type.STRING },
                        past_roles: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
                councilors: {
                    type: Type.ARRAY,
                    description: "Lista de vereadores principais ou mesa diretora",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            role: { type: Type.STRING },
                            party: { type: Type.STRING },
                            past_roles: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                },
                key_servants: {
                    type: Type.ARRAY,
                    description: "Secretários municipais e cargos de confiança",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            department: { type: Type.STRING },
                            role_type: { type: Type.STRING },
                            estimated_salary: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ["city", "mayor", "councilors", "key_servants"]
        };

        // 4. Executa a geração com Search Grounding + Schema Enforcement
        // Usamos gemini-2.5-flash com googleSearch para garantir dados reais.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Pesquise dados oficiais atualizados e gere o relatório administrativo para a cidade de: ${city} (Brasil).`,
            config: {
                systemInstruction: combinedSystemInstruction,
                responseMimeType: 'application/json',
                responseSchema: outputSchema,
                temperature: 0.1, // Baixa temperatura para precisão factual
                tools: [{ googleSearch: {} }] // Força uso de dados reais da web
            }
        });

        // 5. Processamento e Validação da Resposta
        let textResponse = response.text;
        
        // Safety Clean (embora responseSchema evite markdown, garantimos)
        if (textResponse.includes('```json')) {
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');
        } else if (textResponse.includes('```')) {
            textResponse = textResponse.replace(/```/g, '');
        }

        const data = JSON.parse(textResponse.trim());

        // Validação Lógica Básica (Fail-safe)
        if (!data.mayor?.name || data.mayor.name === "Não identificado") {
             // Opcional: Logar que a IA não encontrou dados satisfatórios
             console.warn(`Alerta de baixa confiança para cidade: ${city}`);
        }
        
        // Cálculo de custo
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
        const cost = (usage.promptTokenCount / 1000000 * 0.10) + (usage.candidatesTokenCount / 1000000 * 0.30);

        return { data, cost, tokens: { in: usage.promptTokenCount, out: usage.candidatesTokenCount } };

    } catch (error) {
        console.error("AI Search Error:", error);
        throw new Error("Falha na inteligência governamental. O sistema recusou a resposta por inconsistência.");
    }
};