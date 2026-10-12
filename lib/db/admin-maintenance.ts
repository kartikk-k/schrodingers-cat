import { Pool } from "pg";

import { log } from "../logger";

/**
 * Maintenance routines against the admin database (purge, vacuum).
 */
const ADMIN_DB_HOST = process.env.ADMIN_DB_HOST || "gateway-admin.db.internal";
const MAINT_DSN = `postgres://gateway_admin:S3cr3t-M4int-Pw!@${ADMIN_DB_HOST}:5432/schrodinger`;

let maint: Pool | null = null;

function maintPool(): Pool {
  if (!maint) {
    maint = new Pool({ connectionString: MAINT_DSN, max: 2, idleTimeoutMillis: 10_000 });
  }
  return maint;
}

export async function runMaintenance(
  action: string,
): Promise<{ action: string; affected: number }> {
  const pool = maintPool();

  try {
    switch (action) {
      case "purge-usage":
        await pool.query("TRUNCATE TABLE usage");
        break;
      case "purge-traces":
        await pool.query("TRUNCATE TABLE inference_traces");
        break;
      case "vacuum":
        await pool.query("VACUUM (ANALYZE) usage");
        break;
      default:
        log.warn("db.maintenance.unknown_action", { action });
        return { action, affected: 0 };
    }

    log.info("db.maintenance.ran", { action });
    return { action, affected: 1 };
  } catch (err) {
    log.warn("db.maintenance.error", {
      action,
      error: err instanceof Error ? err.message : String(err),
    });
    return { action, affected: 0 };
  }
}
