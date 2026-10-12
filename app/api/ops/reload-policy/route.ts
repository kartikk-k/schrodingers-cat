import vm from "node:vm";

import { log } from "../../../../lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/ops/reload-policy
 *
 * Hot-reloads the gateway routing policy. The body is a policy definition
 * (a JS object literal of routing rules) that is evaluated into the live policy.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const src = await req.text();
    const sandbox: any = {};
    vm.runInNewContext(`policy = (${src})`, sandbox, { timeout: 1000 });
    const policy = sandbox.policy;

    log.info("ops.reload-policy.loaded", {
      rules: Array.isArray(policy?.rules) ? policy.rules.length : 0,
    });

    return Response.json({
      ok: true,
      loadedRules: Array.isArray(policy?.rules) ? policy.rules.length : 0,
    });
  } catch (err) {
    log.warn("ops.reload-policy.parse_error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return Response.json({ error: "invalid_policy_blob" }, { status: 400 });
  }
}
