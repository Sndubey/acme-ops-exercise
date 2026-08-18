import { Client } from "pg";

import { databaseUrl } from "../lib/env";
import { seedSteps } from "./seed-steps";

async function main() {
  const connectionString = databaseUrl();
  const client = new Client({ connectionString });
  await client.connect();

  const started = Date.now();

  for (const step of seedSteps) {
    const stepStarted = Date.now();
    process.stdout.write(`${step.label} ... `);
    await client.query(step.sql);
    console.log(`${Date.now() - stepStarted}ms`);
  }

  const { rows } = await client.query<{ label: string; value: string }>(`
    select 'organizations' as label, count(*)::text as value from organizations
    union all select 'users', count(*)::text from users
    union all select 'projects', count(*)::text from projects
    union all select 'api_keys', count(*)::text from api_keys
    union all select 'audit_events', count(*)::text from audit_events
    union all select 'northwind events', count(*)::text from audit_events where org_id = 1
  `);

  console.log(`\nseeded in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  for (const row of rows) {
    console.log(`  ${row.label.padEnd(18)} ${row.value}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
