import { runMonitoringCycle } from './collectorService.js';

// Intervalo de verificação: 60 segundos
const TICK_RATE = 60 * 1000;

let intervalId = null;

export const startScheduler = () => {
    if (intervalId) {
        console.log("Scheduler already running.");
        return;
    }

    console.log("⏰ Scheduler Service Started (Tick: 60s)");

    // Executa imediatamente ao iniciar
    runSafeCycle();

    intervalId = setInterval(async () => {
        await runSafeCycle();
    }, TICK_RATE);
};

export const stopScheduler = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("Scheduler Stopped.");
    }
};

const runSafeCycle = async () => {
    try {
        // Chama o coletor sem userId, ativando o modo "Auto/Global"
        // Ele vai buscar no banco apenas tarefas pendentes (Hourly/Daily)
        await runMonitoringCycle();
    } catch (err) {
        console.error("Critical Scheduler Error:", err);
    }
};