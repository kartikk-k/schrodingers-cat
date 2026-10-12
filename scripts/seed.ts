/**
 * Seed script.
 *
 * In production this would upsert the API keys / orgs / usage rows into the
 * Postgres primary. In dev the data is loaded in-memory, so seeding is a no-op
 * that simply reports what's available.
 */
import { apiKeys, usage, users } from "../data/store";

function main() {
  // eslint-disable-next-line no-console
  console.log("Schrödinger's Cat — seed");
  console.log(`  orgs/users : ${users.length}`);
  console.log(`  api keys   : ${apiKeys.length}`);
  console.log(`  usage rows : ${usage.length}`);
  console.log("Dev data is loaded in-memory at request time. Nothing to write.");
}

main();
