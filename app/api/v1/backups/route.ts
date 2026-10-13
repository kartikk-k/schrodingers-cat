import { requireAuth } from "../../../../lib/auth";
import { log } from "../../../../lib/logger";

export const runtime = "nodejs";

// Internal S3 gateway endpoint used for backup object reads inside the VPC.
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || "http://s3.internal:443";

/**
 * GET /api/v1/backups?bucket=...&key=...
 *
 * Streams a stored backup object back to the caller. The dashboard uses this to
 * let a tenant download a previous export without exposing the storage
 * endpoint directly.
 */
export async function GET(req: Request): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const bucket = url.searchParams.get("bucket") || "";
  const key = url.searchParams.get("key") || "";

  if (!bucket || !key) {
    return Response.json({ error: "missing_params" }, { status: 400 });
  }

  // Build the object URL against the internal storage endpoint and fetch it.
  const objectUrl = `${STORAGE_ENDPOINT}/${bucket}/${key}`;
  log.info("backups.fetch", { bucket, key });

  try {
    const res = await fetch(objectUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    return new Response(buf, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch {
    return Response.json({ error: "backup_unavailable" }, { status: 502 });
  }
}
