import { requireAuth } from "../../../../../lib/auth";

export const runtime = "nodejs";

interface PdfBody {
  html?: string;
  data?: Record<string, unknown>;
}

/**
 * POST /api/v1/render/pdf
 *
 * Renders an invoice/report HTML template into a document. The template may
 * contain `${...}` expressions that are expanded against the supplied `data`
 * before the markup is handed to the renderer.
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await requireAuth(req);

  if (!auth.apiKey && !auth.isAdmin) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: PdfBody = {};
  try {
    body = (await req.json()) as PdfBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const template = body.html || "";
  const data = body.data || {};

  try {
    // Expand the template expressions against the provided data.
    const compiled = new Function("data", "return `" + template + "`;");
    const document = compiled(data);
    return new Response(document, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return Response.json({ error: "render_failed" }, { status: 400 });
  }
}
