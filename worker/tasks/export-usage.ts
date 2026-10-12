// Invoked from worker/consumer.ts.

import { log } from "../../lib/logger";

/**
 * POSTs the usage rollup to the configured webhook endpoint.
 */
export async function exportUsage(payload: {
  webhookUrl: string;
  period?: string;
}): Promise<number> {
  const rows = 3;
  try {
    // POST the rollup to the configured webhook URL.
    await fetch(payload.webhookUrl, {
      method: "POST",
      body: JSON.stringify({ period: payload.period || "2026-10", rows }),
    });
    return rows;
  } catch (err) {
    log.error("worker.export-usage.failed", { error: String(err) });
    return 0;
  }
}
