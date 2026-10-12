/**
 * Queue consumer entrypoint (`npm run worker`).
 *
 * Polls the job queue for a batch and dispatches each job to its handler.
 */

import { log } from "../lib/logger";

import { nextJobs } from "./queue";
import { runEval } from "./tasks/run-eval";
import { syncTemplates } from "./tasks/sync-templates";
import { exportUsage } from "./tasks/export-usage";

async function main(): Promise<void> {
  const jobs = await nextJobs();
  log.info("worker.consumer.batch", { count: jobs.length });

  for (const job of jobs) {
    try {
      switch (job.type) {
        case "run-eval": {
          const out = await runEval(job.payload);
          log.info("worker.consumer.job.done", { id: job.id, type: job.type, result: out });
          break;
        }
        case "sync-templates": {
          const out = await syncTemplates(job.payload);
          log.info("worker.consumer.job.done", { id: job.id, type: job.type, result: out });
          break;
        }
        case "export-usage": {
          const count = await exportUsage(job.payload);
          log.info("worker.consumer.job.done", { id: job.id, type: job.type, rows: count });
          break;
        }
        default:
          log.warn("worker.consumer.job.unknown", { id: job.id, type: job.type });
      }
    } catch (err) {
      log.error("worker.consumer.job.error", { id: job.id, type: job.type, error: String(err) });
    }
  }

  log.info("worker.consumer.batch.complete", { count: jobs.length });
}

void main();
