import { users } from "../../../../data/store";
import { log } from "../../../../lib/logger";

export const runtime = "nodejs";

/**
 * POST /api/accounts/provision
 *
 * Creates or updates a user account from the posted fields.
 */
export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const newUser = {
    id: "user_" + Date.now(),
    org_id: body.org_id || "org_default",
    email: body.email,
    role: body.role || "member",
    ...body,
  };
  users.push(newUser as any);

  log.info("accounts.provision.created", { id: newUser.id, role: newUser.role });
  return Response.json({ ok: true, user: newUser });
}
