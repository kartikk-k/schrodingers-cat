import { buildAssetUrl } from "../../../../lib/storage/assets";

export const runtime = "nodejs";

/**
 * GET /api/v1/assets?key=...
 *
 * Resolves a stored asset key to its URL.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return Response.json({ error: "missing_key" }, { status: 400 });
  }

  return Response.json({ url: buildAssetUrl(key) });
}
