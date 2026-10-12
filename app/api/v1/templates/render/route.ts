export const runtime = "nodejs";

interface RenderBody {
  template?: string;
  vars?: Record<string, unknown>;
}

/**
 * POST /api/v1/templates/render
 *
 * Renders a prompt template, substituting `${...}` placeholders from the
 * supplied variables.
 */
export async function POST(req: Request): Promise<Response> {
  let body: RenderBody = {};
  try {
    body = (await req.json()) as RenderBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const template = body.template || "";
  const vars = body.vars || {};

  try {
    // Render the template with the provided variables.
    const rendered = new Function("vars", "return `" + template + "`;")(vars);
    return Response.json({ rendered }, { status: 200 });
  } catch {
    return Response.json({ error: "render_failed" }, { status: 400 });
  }
}
