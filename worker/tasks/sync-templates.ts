// Invoked from worker/consumer.ts.

import fs from "fs";
import path from "path";

import { log } from "../../lib/logger";

const TEMPLATES_DIR = path.join(process.cwd(), "data", "templates");

/**
 * Loads a notification/response template by name so the worker can sync it.
 */
export async function syncTemplates(payload: { name: string }): Promise<string> {
  try {
    // Resolve the template path under TEMPLATES_DIR and read it.
    const resolved = path.join(TEMPLATES_DIR, payload.name);
    return fs.readFileSync(resolved, "utf8");
  } catch (err) {
    log.error("worker.sync-templates.failed", { error: String(err) });
    return "[template missing]";
  }
}
