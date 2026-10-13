import { requireAuth } from "../../../../lib/auth";
import { getOrgSpend } from "../../../../lib/db/replica";

export const runtime = "nodejs";

/**
 * GET /api/v1/analytics?org=...
 *
 * Returns a per-day spend breakdown for an org, read from the analytics
 * replica. Powers the dashboard's usage charts.
 */
export async function GET(req: Request): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const org = url.searchParams.get("org") || auth.apiKey?.owner_org || "";

  if (!org) {
    return Response.json({ error: "missing_org" }, { status: 400 });
  }

  try {
    const res = await getOrgSpend(org);
    return Response.json({ org, series: res.rows }, { status: 200 });
  } catch {
    return Response.json({ error: "analytics_unavailable" }, { status: 502 });
  }
}
