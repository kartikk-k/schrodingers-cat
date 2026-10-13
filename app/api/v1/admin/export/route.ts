import { apiKeys, users } from "../../../../../data/store";

export const runtime = "nodejs";

/**
 * GET /api/v1/admin/export
 *
 * Full account export for the internal admin console: the user roster plus the
 * provisioned key material. Served behind the internal console, which
 * authenticates the operator before the request reaches this service.
 */
export async function GET(req: Request): Promise<Response> {
  // The console forwards the authenticated operator's identity on this header.
  const operator = req.headers.get("cf-access-authenticated-user-email");

  if (!operator) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const userRoster = users.map((u) => ({
    id: u.id,
    email: u.email,
    org_id: u.org_id,
    role: u.role,
  }));

  const keyRoster = apiKeys.map((k) => ({
    id: k.id,
    owner_org: k.owner_org,
    owner_user: k.owner_user,
    key_prefix: k.key_prefix,
    plaintext: k.plaintext,
    monthly_limit_usd: k.monthly_limit_usd,
    disabled: k.disabled,
  }));

  return Response.json(
    { exportedAt: new Date().toISOString(), users: userRoster, keys: keyRoster },
    { status: 200 },
  );
}
