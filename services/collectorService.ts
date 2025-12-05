import { db } from './db';
import { GoogleGenAI, Type } from "@google/genai";

// Inicializa o cliente Gemini
// Fallback seguro caso a chave não esteja presente na demo
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ⚠️ CUSTOS DO SAAS (SIMULAÇÃO DE PRICING)
// Valores definidos para auditoria de margem de lucro
const COST_INPUT_PER_1K_USD = 0.000125;  // $0.125 por 1k tokens (Entrada)
const COST_OUTPUT_PER_1K_USD = 0.000375; // $0.375 por 1k tokens (Saída)

// 4.2. ANÁLISE REAL: API Gemini 2.5 Flash
async function analyzeDataWithIA(text: string) {
  // Se tivermos a chave API, fazemos a análise real
  if (ai) {
    try {
      // 1. Definição da Persona e Regras via System Instruction
      const systemInstruction = `
        Você é um analista sênior de reputação corporativa.
        Sua tarefa é analisar notícias e dados monitorados para extrair inteligência estratégica.
        
        Saída OBRIGATÓRIA em JSON com os campos:
        - sentiment: "Positivo", "Negativo", "Neutro" ou "Misto".
        - impact: "Baixo", "Médio" ou "Alto" (Baseado no risco de imagem).
        - summary: Resumo executivo em Português (PT-BR), direto e formal (max 15 palavras).
        - keywords: Array com as 3 principais entidades citadas.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text, // O conteúdo é apenas o dado bruto, a instrução vai na config
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, enum: ["Positivo", "Negativo", "Neutro", "Misto"] },
              impact: { type: Type.STRING, enum: ["Baixo", "Médio", "Alto"] },
              summary: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      const usage = response.usageMetadata;

      // 2. Cálculo de Custo Real (Modelo Detalhado)
      const inputTokens = usage?.promptTokenCount || 0;
      const outputTokens = usage?.candidatesTokenCount || 0;
      
      const inputCost = (inputTokens / 1000) * COST_INPUT_PER_1K_USD;
      const outputCost = (outputTokens / 1000) * COST_OUTPUT_PER_1K_USD;
      const totalCost = inputCost + outputCost;

      return {
        sentiment: data.sentiment || "Neutro",
        impact: data.impact || "Baixo",
        tokens_in: inputTokens,
        tokens_out: outputTokens,
        cost: totalCost,
        summary: data.summary || "Resumo indisponível.",
        keywords: data.keywords || []
      };

    } catch (error) {
      console.error("Erro na Análise Gemini Real:", error);
      // Fallback em caso de erro na API
    }
  }

  // --- FALLBACK (MOCKUP) ---
  // Usado se não houver API Key ou ocorrer erro na requisição
  const estimatedTokens = text.length > 100 ? 150 : 50;
  const tokensIn = Math.floor(estimatedTokens * 0.8);
  const tokensOut = Math.floor(estimatedTokens * 0.2);
  
  // Custo estimado com a mesma fórmula
  const estimatedCostUsd = (tokensIn/1000 * COST_INPUT_PER_1K_USD) + (tokensOut/1000 * COST_OUTPUT_PER_1K_USD);

  const sentimentOptions = ['Positivo', 'Negativo', 'Neutro', 'Misto'];
  const impactOptions = ['Baixo', 'Médio', 'Alto'];
  const randImpact = impactOptions[Math.floor(Math.random() * impactOptions.length)];

  return {
    sentiment: sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)],
    impact: randImpact,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost: estimatedCostUsd,
    summary: `Análise Estratégica (Simulada): Impacto ${randImpact} detectado.`,
    keywords: ["Simulação", "Dados", "SaaS"]
  };
}

/**
 * CORE: Lógica de Coleta e Processamento (Gatilho Cron)
 * Endpoint simulado: /api/monitoring/trigger
 */
export const runMonitoringCycle = async (cronKey: string) => {
  // Verificação de Segurança
  if (cronKey !== 'SECRET_CRON_KEY') {
    throw new Error('Não autorizado: Chave CRON inválida');
  }

  console.log("Iniciando Ciclo de Monitoramento (Core v2.1 - Gemini Flash)...");
  
  const activeConfigs = db.getActiveMonitoringConfigs();

  const report = {
    processed: 0,
    errors: 0,
    totalCost: 0
  };

  for (const config of activeConfigs) {
    try {
      console.log(`Processando config ID: ${config.user_id}`);
      
      const sub = db.getSubscriptionByUserId(config.user_id);
      
      // CHECK CRÍTICO: Verificar se o usuário tem o plugin de IA (plg_1) ativo no plano
      const isAiEnabled = db.isPluginEnabledForPlan('plg_1', sub?.plan_id);

      // Simula Crawler
      const topics = config.keywords.join(', ');
      const simulatedContent = `
        RELATÓRIO: Novas menções sobre ${topics}.
        Analistas indicam alta volatilidade no setor devido a mudanças regulatórias recentes.
        A concorrência apresentou resultados acima do esperado.
        Data: ${new Date().toLocaleDateString('pt-BR')}
      `;

      let analysis;
      let endpointLog = 'AI_ANALYSIS_GEMINI_V2';

      if (isAiEnabled) {
          // Plano tem IA: Executa análise completa
          analysis = await analyzeDataWithIA(simulatedContent);
      } else {
          // Plano NÃO tem IA: Executa análise básica (sem custo de LLM)
          console.log(`[Limit] Usuário ${config.user_id} sem plugin de IA.`);
          endpointLog = 'BASIC_CRAWLER_NO_AI';
          analysis = {
             sentiment: 'N/A (Upgrade Plan)',
             impact: 'N/A',
             summary: 'Resumo IA Indisponível. Atualize seu plano.',
             keywords: config.keywords,
             tokens_in: 0,
             tokens_out: 0,
             cost: 0
          };
      }

      // Persistência
      db.saveMasterItem({
        user_id: config.user_id,
        source_url: config.urls_to_track[0] || 'http://monitoramento.interno',
        analyzed_content: simulatedContent.trim(),
        ai_summary: analysis.summary,
        detected_keywords: analysis.keywords.length > 0 ? analysis.keywords : config.keywords,
      });

      // Auditoria de Custos (Log Detalhado)
      db.logRequest({
        user_id: config.user_id,
        endpoint: endpointLog,
        request_tokens: analysis.tokens_in,
        response_tokens: analysis.tokens_out,
        cost_usd: parseFloat(analysis.cost.toFixed(8)),
        status: 'SUCESSO'
      });

      report.processed++;
      report.totalCost += analysis.cost;

    } catch (err) {
      console.error(`Erro config ${config.user_id}:`, err);
      report.errors++;
      
      db.logRequest({
        user_id: config.user_id,
        endpoint: 'MONITORING_ERROR',
        request_tokens: 0,
        response_tokens: 0,
        cost_usd: 0,
        status: 'ERRO'
      });
    }
  }

  return report;
};