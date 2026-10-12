// Invoked from worker/consumer.ts.

import { exec } from "child_process";
import { promisify } from "util";

import { log } from "../../lib/logger";

const execAsync = promisify(exec);

/**
 * Runs the model eval harness for a job's target model.
 *
 * There is no real ./bin/eval-harness here, so the call throws and we fall back
 * to "[eval failed]".
 */
export async function runEval(payload: {
  modelName: string;
  dataset?: string;
}): Promise<string> {
  try {
    const dataset = payload.dataset || "default";
    // Build the eval harness command for the requested model and dataset.
    const { stdout } = await execAsync(
      `./bin/eval-harness --model ${payload.modelName} --dataset ${dataset}`,
    );
    return stdout;
  } catch (err) {
    log.error("worker.run-eval.failed", { error: String(err) });
    return "[eval failed]";
  }
}
