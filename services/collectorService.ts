/**
 * DEPRECATED: The monitoring logic has been moved to the backend to run securely and autonomously.
 * 
 * See:
 * - backend/services/collectorService.js (Core Logic)
 * - backend/routes/monitoring.js (Trigger Endpoint)
 */

export const runMonitoringCycle = async (_cronKey: string) => {
  console.warn("Frontend collector simulation is deprecated. Please use the API trigger.");
  throw new Error("Use api.triggerCollection() instead.");
};