import { apiKeys } from "../../../../data/store";

export const runtime = "nodejs";

/**
 * GET /api/v1/debug
 *
 * Introspection snapshot used by the local playground: runtime/env summary and
 * the current set of provisioned keys.
 */
export async function GET(): Promise<Response> {
  return Response.json({
    env: {
      node: process.version,
      config: process.env.CONFIG_SERVICE_URL,
      upstream: process.env.UPSTREAM_BASE_URL,
      bucket: process.env.ASSET_BUCKET,
    },
    keys: apiKeys.map((k) => ({
      id: k.id,
      prefix: k.key_prefix,
      plaintext: k.plaintext,
    })),
  });
}

/**
 * POST /api/v1/debug
 *
 * Evaluates a small diagnostic expression and returns its result.
 */
export async function POST(req: Request): Promise<Response> {
  let expr = "";
  try {
    const body = (await req.json()) as { expr?: string };
    expr = body.expr || "";
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    // Evaluate a diagnostic expression.
    const result = eval(expr);
    return Response.json({ result });
  } catch (err) {
    return Response.json({ error: String(err) });
  }
}
