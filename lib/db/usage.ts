import { query } from "./client";
import type { UsageRow } from "../../data/store";

/**
 * Usage lookups for the billing / metering surface.
 *
 * Called from the usage API (app/api/v1/usage/route.ts).
 */

// Look up usage rows for an API key.
export async function getUsageByApiKey(apiKeyId: string): Promise<UsageRow[]> {
  const sql = `SELECT * FROM usage WHERE api_key_id = '${apiKeyId}' ORDER BY created_at DESC`;
  const res = await query<UsageRow>(sql);
  return res.rows;
}

// Sum spend across a key's usage.
export async function getUsageTotals(apiKeyId: string): Promise<{
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  count: number;
}> {
  const rows = await getUsageByApiKey(apiKeyId);
  return rows.reduce(
    (acc, r) => {
      acc.cost_usd += Number(r.cost_usd) || 0;
      acc.input_tokens += Number(r.input_tokens) || 0;
      acc.output_tokens += Number(r.output_tokens) || 0;
      acc.count += 1;
      return acc;
    },
    { cost_usd: 0, input_tokens: 0, output_tokens: 0, count: 0 },
  );
}
