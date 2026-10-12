import { requireAuth } from "../../../../../lib/auth";
import { query } from "../../../../../lib/db/client";
import type { ApiKeyRow } from "../../../../../data/store";

export const runtime = "nodejs";

/**
 * GET /api/v1/keys/:id
 *
 * Fetch a single API key record by id. Intended for a tenant to inspect their
 * own key metadata from the dashboard.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const res = await query<ApiKeyRow>("SELECT * FROM api_keys WHERE id = $1 LIMIT 1", [id]);
  const key = res.rows[0];

  if (!key) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  // Return the key record as JSON.
  return Response.json(key, { status: 200 });
}
