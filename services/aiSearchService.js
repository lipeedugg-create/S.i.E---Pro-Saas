import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const searchCityAdmin = async (city) => {
    if (!ai) {
        throw new Error("Serviço de IA indisponível (API Key não configurada).");
    }

    try {
        const prompt = `
            Você é o SISTEMA SIE (Strategic Intelligence Enterprise).
            Sua tarefa é gerar um relatório de transparência pública sobre a administração da cidade de: ${city} (Brasil).

            DADOS NECESSÁRIOS:
            1. Prefeito Atual (Nome, Partido, Cargos Anteriores na carreira)
            2. Vice-Prefeito (Nome, Partido)
            3. Vereadores (Liste pelo menos 5 principais ou mesa diretora, com seus partidos e, se possível, cargos anteriores)
            4. Funcionários Públicos Chave (Secretários Municipais ex: Saúde, Educação, Obras). Inclua Nome, Lotação (Secretaria), Vínculo (Comissionado/Efetivo) e Salário Estimado (baseado na média de mercado para o porte da cidade ou dados públicos conhecidos).

            FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
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
            
            IMPORTANTE: 
            - Responda APENAS o JSON. 
            - Não use blocos de código markdown (\`\`\`json).
            - Se não encontrar dados exatos de salário, estime com base no portal da transparência.
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