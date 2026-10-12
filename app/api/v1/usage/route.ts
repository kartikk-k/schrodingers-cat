import { requireAuth } from "../../../../lib/auth";
import { getUsageByApiKey, getUsageTotals } from "../../../../lib/db/usage";

export const runtime = "nodejs";

/**
 * GET /api/v1/usage
 *
 * Returns usage rows and aggregate totals for an API key.
 */
export async function GET(req: Request): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  // Caller-supplied api_key_id; falls back to the authenticated key's id.
  const apiKeyId = url.searchParams.get("api_key_id") || auth.apiKey?.id || "";

  const usage = await getUsageByApiKey(apiKeyId);
  const totals = await getUsageTotals(apiKeyId);

  return Response.json({ usage, totals }, { status: 200 });
}
