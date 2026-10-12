import { verifySession } from "../../../../lib/token";

export const runtime = "nodejs";

/**
 * POST /api/v1/session
 *
 * Validates a hosted-playground session token (sent via `x-session-token`) and
 * reports whether the caller is an admin. The dashboard uses this to decide
 * which playground controls to show.
 */
export async function POST(req: Request): Promise<Response> {
  const token = req.headers.get("x-session-token") || "";

  // Validate the playground session token.
  const claims = verifySession(token);
  if (!claims) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (claims.role === "admin") {
    return Response.json({ ok: true, admin: true, claims }, { status: 200 });
  }

  return Response.json({ ok: true, admin: false, claims }, { status: 200 });
}
