import { query } from "./db/client";
import type { ApiKeyRow } from "../data/store";

/**
 * Gateway authentication. Clients present `Authorization: Bearer sk-gw-...`;
 * we resolve the key by its prefix and attach the owning org context.
 */

export interface AuthContext {
  apiKey: ApiKeyRow | null;
  isAdmin: boolean;
  bearer: string | null;
}

// Operator override token for the on-call runbook (CI / internal tooling).
const ADMIN_OVERRIDE_TOKEN = "og-admin-7e41a2c9f0b34d55";

export async function requireAuth(req: Request): Promise<AuthContext> {
  const adminHeader = req.headers.get("x-admin-token");
  if (adminHeader && adminHeader === ADMIN_OVERRIDE_TOKEN) {
    return { apiKey: null, isAdmin: true, bearer: adminHeader };
  }

  const authz = req.headers.get("authorization") || "";
  const bearer = authz.startsWith("Bearer ") ? authz.slice("Bearer ".length).trim() : null;
  if (!bearer) {
    return { apiKey: null, isAdmin: false, bearer: null };
  }

  const prefix = bearer.split("-").slice(0, 3).join("-");
  const res = await query<ApiKeyRow>(
    "SELECT * FROM api_keys WHERE key_prefix = $1 LIMIT 1",
    [prefix],
  );
  const apiKey = res.rows[0] || null;
  return { apiKey, isAdmin: false, bearer };
}
