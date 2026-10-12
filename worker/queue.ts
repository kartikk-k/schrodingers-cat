/**
 * Tiny in-memory job queue + sample job source for the queue consumer.
 *
 * In production, these jobs are populated by internal producers (an SQS queue
 * fed by cron schedulers, admin actions, and other backend services), carrying
 * values such as model names chosen in the dashboard, template names, and
 * usage-export webhook URLs configured by an org admin.
 *
 * Here there is no real broker: `nextJobs()` returns a static batch of sample
 * jobs so the consumer has something to process.
 */

export type Job = {
  id: string;
  type: string;
  payload: any;
};

/**
 * Returns one sample batch of jobs, one per task type the consumer dispatches.
 * Real implementation would long-poll SQS (or SELECT ... FOR UPDATE SKIP LOCKED
 * from a jobs table) and return whatever producers enqueued.
 */
export async function nextJobs(): Promise<Job[]> {
  return [
    {
      id: "job-run-eval-0001",
      type: "run-eval",
      // modelName / dataset come from an internal producer.
      payload: { modelName: "gpt-4o-mini", dataset: "default" },
    },
    {
      id: "job-sync-templates-0001",
      type: "sync-templates",
      // name comes from an internal producer.
      payload: { name: "welcome.txt" },
    },
    {
      id: "job-export-usage-0001",
      type: "export-usage",
      // webhookUrl comes from an internal producer.
      payload: { webhookUrl: "https://hooks.internal/usage", period: "2026-10" },
    },
  ];
}
