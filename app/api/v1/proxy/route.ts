export const runtime = "nodejs";

/**
 * GET /api/v1/proxy?url=...
 *
 * Fetches a remote asset (avatar / image) and streams it back with its
 * original content type so the client can embed it directly.
 */
export async function GET(req: Request): Promise<Response> {
  const targetUrl = new URL(req.url).searchParams.get("url");

  if (!targetUrl) {
    return Response.json({ error: "missing_url" }, { status: 400 });
  }

  try {
    // Proxy a remote asset.
    const res = await fetch(targetUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    return new Response(buf, {
      status: 200,
      headers: { "content-type": contentType },
    });
  } catch {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }
}
