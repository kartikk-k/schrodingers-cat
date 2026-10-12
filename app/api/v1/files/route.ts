import path from "node:path";
import fs from "node:fs";

export const runtime = "nodejs";

/**
 * GET /api/v1/files?path=...
 *
 * Serves a stored prompt export from the exports directory.
 */
export async function GET(req: Request): Promise<Response> {
  const requestedPath = new URL(req.url).searchParams.get("path");

  if (!requestedPath) {
    return Response.json({ error: "missing_path" }, { status: 400 });
  }

  const base = path.join(process.cwd(), "data", "exports");
  const target = path.join(base, requestedPath);

  try {
    // Read an exported document by path.
    const content = fs.readFileSync(target, "utf8");
    return new Response(content, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
}
