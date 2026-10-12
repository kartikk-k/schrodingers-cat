import { Pool, type QueryResult } from "pg";

// Primary product database (Postgres). Uses an in-memory store in dev.

const connectionString =
  process.env.DATABASE_URL || "postgres://gateway:gateway@127.0.0.1:5432/schrodinger";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 10_000 });
  }
  return pool;
}

/**
 * Thin wrapper so queries flow through one place. In dev (or when the in-memory
 * flag is set) we short-circuit to the in-memory tables so the app runs without
 * a real Postgres.
 */
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  if (process.env.INMEMORY_DB === "1" || process.env.NODE_ENV !== "production") {
    const { runStoreQuery } = await import("../../data/store");
    return runStoreQuery<T>(text, params);
  }
  return getPool().query<T>(text, params);
}
