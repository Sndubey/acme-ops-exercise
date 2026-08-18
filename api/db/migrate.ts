import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { databaseUrl } from "../lib/env";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

async function main() {
  const connectionString = databaseUrl();
  const client = new Client({ connectionString });
  await client.connect();

  if (process.argv.includes("--reset")) {
    console.log("dropping schema public");
    await client.query("drop schema public cascade; create schema public;");
  }

  await client.query(`
    create table if not exists schema_migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const applied = new Set(
    (await client.query<{ name: string }>("select name from schema_migrations")).rows.map(
      (r) => r.name,
    ),
  );

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`applying ${file} ... `);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log("ok");
      ran++;
    } catch (err) {
      await client.query("rollback");
      console.log("failed");
      throw err;
    }
  }

  console.log(ran === 0 ? "already up to date" : `applied ${ran} migration(s)`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
