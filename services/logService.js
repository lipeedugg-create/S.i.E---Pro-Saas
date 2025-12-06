import { query } from '../config/db.js';

/**
 * Registra uma transação de uso da API (Logs de Auditoria).
 * Essencial para o cálculo de faturamento baseado em uso (Usage-Based Billing).
 */
export const logRequest = async ({ userId, endpoint, tokensIn = 0, tokensOut = 0, cost = 0, status = 'SUCCESS' }) => {
    try {
        await query(
            `INSERT INTO requests_log (user_id, endpoint, request_tokens, response_tokens, cost_usd, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, endpoint, tokensIn, tokensOut, cost, status]
        );
    } catch (e) {
        // Falha silenciosa para não interromper o fluxo principal, mas loga no console
        console.error("⚠️ FALHA AO REGISTRAR LOG DE AUDITORIA:", e.message);
    }
};