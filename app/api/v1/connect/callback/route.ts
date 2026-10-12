import { log } from "../../../../../lib/logger";

export const runtime = "nodejs";

/**
 * GET /api/v1/connect/callback?code=...&next=...
 *
 * OAuth-style provider-connect callback. After a tenant authorizes an upstream
 * provider, the provider redirects back here with an authorization `code`; we
 * exchange it and then send the user on to wherever they came from (`next`).
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const next = url.searchParams.get("next") || "/";

  // Pretend to exchange the authorization code for provider tokens.
  log.info("connect.callback.exchange", { code });

  // Complete the connect flow and return the user to `next`.
  return new Response(null, { status: 302, headers: { Location: next } });
}
