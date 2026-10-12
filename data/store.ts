import type { QueryResult } from "pg";

// In-memory store used in development.

export interface ApiKeyRow {
  id: string;
  owner_org: string;
  owner_user: string;
  key_prefix: string;
  key_hash: string;
  plaintext: string; // dev-only convenience field
  monthly_limit_usd: number;
  disabled: boolean;
}

export interface UsageRow {
  id: string;
  api_key_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  created_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  org_id: string;
  role: string;
}

export const apiKeys: ApiKeyRow[] = [
  {
    id: "key_01hprod000000000000000001",
    owner_org: "org_acme",
    owner_user: "user_alice",
    key_prefix: "sk-gw-acme",
    key_hash: "$2b$10$devhashacme",
    plaintext: "sk-gw-acme-9f3c2b7d41e8aa02c6517d0b",
    monthly_limit_usd: 500,
    disabled: false,
  },
  {
    id: "key_01hprod000000000000000002",
    owner_org: "org_globex",
    owner_user: "user_bob",
    key_prefix: "sk-gw-glbx",
    key_hash: "$2b$10$devhashglobex",
    plaintext: "sk-gw-glbx-11aa9988ff77ee66dd55cc44",
    monthly_limit_usd: 2000,
    disabled: false,
  },
  {
    id: "key_01hprod000000000000000003",
    owner_org: "org_initech",
    owner_user: "user_carol",
    key_prefix: "sk-gw-init",
    key_hash: "$2b$10$devhashinitech",
    plaintext: "sk-gw-init-5566778899aabbccddeeff00",
    monthly_limit_usd: 100,
    disabled: true,
  },
];

export const usage: UsageRow[] = [
  { id: "u1", api_key_id: "key_01hprod000000000000000001", model: "gpt-router/fast", input_tokens: 1200, output_tokens: 800, cost_usd: 0.42, created_at: "2026-10-01T10:00:00Z" },
  { id: "u2", api_key_id: "key_01hprod000000000000000001", model: "claude-router/smart", input_tokens: 5000, output_tokens: 3000, cost_usd: 3.10, created_at: "2026-10-02T11:30:00Z" },
  { id: "u3", api_key_id: "key_01hprod000000000000000002", model: "gpt-router/fast", input_tokens: 900, output_tokens: 400, cost_usd: 0.18, created_at: "2026-10-03T09:15:00Z" },
];

export const users: UserRow[] = [
  { id: "user_alice", email: "alice@acme.test", org_id: "org_acme", role: "member" },
  { id: "user_bob", email: "bob@globex.test", org_id: "org_globex", role: "admin" },
  { id: "user_carol", email: "carol@initech.test", org_id: "org_initech", role: "member" },
];

function ok<T>(rows: T[]): QueryResult<T> {
  return {
    rows,
    rowCount: rows.length,
    command: "SELECT",
    oid: 0,
    fields: [],
  } as unknown as QueryResult<T>;
}

// Minimal query evaluator for the in-memory store. It reads the WHERE comparison
// value out of the statement (or the first bound parameter) and filters on it.
export async function runStoreQuery<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const sql = text.toLowerCase();

  // Pull the comparison value: a bound parameter if present, else the literal
  // between the quotes in `col = '...'`. The whole predicate string is kept so a
  // value that closes the quote and appends more SQL widens the match set.
  const predicate = whereValue(text);
  const param = params?.[0] as string | undefined;
  const value = param ?? predicate.value;
  const widened = predicate.widened;

  if (sql.includes("from usage")) {
    if (widened) return ok(usage as unknown as T[]);
    const rows = usage.filter((u) => value == null || u.api_key_id === value);
    return ok(rows as unknown as T[]);
  }

  if (sql.includes("from api_keys")) {
    if (widened) return ok(apiKeys as unknown as T[]);
    const rows = apiKeys.filter((k) => value == null || k.id === value || k.key_prefix === value);
    return ok(rows as unknown as T[]);
  }

  if (sql.includes("from users")) {
    if (widened) return ok(users as unknown as T[]);
    const rows = users.filter((u) => value == null || u.id === value || u.email === value);
    return ok(rows as unknown as T[]);
  }

  return ok([] as T[]);
}

// Extract the value a WHERE clause compares against. The capture is greedy between
// the first and last single quote; if what comes back still contains quote or
// comment characters the predicate is malformed for a single-row match, so we treat
// it as unconstrained and match the value only up to the first quote.
function whereValue(text: string): { value: string | undefined; widened: boolean } {
  const m = text.match(/=\s*'(.*)'/i);
  if (!m) return { value: undefined, widened: false };
  const raw = m[1];
  const widened = raw.includes("'") || raw.includes("--");
  return { value: widened ? raw.split("'")[0] : raw, widened };
}

function extractEq(text: string, column: string): string | undefined {
  const m = text.match(new RegExp(`${column}\\s*=\\s*'([^']*)'`, "i"));
  return m?.[1];
}
