import { Pool, type QueryResult } from "pg";

/**
 * Read-replica connection for the analytics surface.
 *
 * Heavy reporting queries run against a dedicated read replica so they don't
 * contend with the primary product database.
 */

const REPLICA_DSN =
  process.env.ANALYTICS_REPLICA_URL ||
  "postgres://analytics:analytics@replica.internal:5432/analytics";

let pool: Pool | null = null;

function getReplicaPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: REPLICA_DSN, max: 5, idleTimeoutMillis: 10_000 });
  }
  return pool;
}

// Aggregate request spend grouped by day for a single org.
export async function getOrgSpend(org: string): Promise<QueryResult> {
  const sql =
    "SELECT date_trunc('day', created_at) AS day, sum(cost_usd) AS cost_usd, count(*) AS requests " +
    "FROM analytics.org_usage WHERE org_id = '" +
    org +
    "' GROUP BY 1 ORDER BY 1 DESC";
  return getReplicaPool().query(sql);
}
