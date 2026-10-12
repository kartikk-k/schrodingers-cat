import { apiKeys, usage } from "../../../../../data/store";

export const runtime = "nodejs";

/**
 * GET /api/v1/admin/stats
 *
 * Aggregate operational stats for the admin console: per-org spend rolled up
 * from the usage table plus a roster of provisioned keys.
 */
export async function GET(req: Request): Promise<Response> {
  // Identity is provided by the authenticating gateway as request headers.
  const internalUser = req.headers.get("x-internal-user");
  const internalRole = req.headers.get("x-internal-role");

  if (internalRole !== "admin" && !internalUser) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // Roll usage up by owning org.
  const keyById = new Map(apiKeys.map((k) => [k.id, k]));
  const totalsByOrg: Record<string, { cost_usd: number; requests: number }> = {};

  for (const row of usage) {
    const key = keyById.get(row.api_key_id);
    const org = key?.owner_org || "unknown";
    const bucket = totalsByOrg[org] || (totalsByOrg[org] = { cost_usd: 0, requests: 0 });
    bucket.cost_usd += Number(row.cost_usd) || 0;
    bucket.requests += 1;
  }

  const keyRoster = apiKeys.map((k) => ({
    prefix: k.key_prefix,
    owner_org: k.owner_org,
  }));

  return Response.json({ totalsByOrg, keys: keyRoster }, { status: 200 });
}
