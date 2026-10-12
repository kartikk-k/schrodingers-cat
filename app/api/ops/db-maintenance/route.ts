import { runMaintenance } from "../../../../lib/db/admin-maintenance";
import { log } from "../../../../lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/ops/db-maintenance
 *
 * Runs a maintenance routine against the primary database (purge-usage,
 * purge-traces, vacuum).
 */
export async function POST(req: Request): Promise<Response> {
  let action = "";
  try {
    const body = await req.json();
    action = typeof body?.action === "string" ? body.action : "";
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  log.info("ops.db-maintenance.request", { action });
  const result = await runMaintenance(action);
  return Response.json(result);
}
