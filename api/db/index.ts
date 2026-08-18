import { Pool, type PoolClient, type QueryResultRow } from "pg";

import { databaseUrl, loadEnv } from "../lib/env";

let instance: Pool | null = null;

export function getPool(): Pool {
  if (!instance) {
    instance = new Pool({ connectionString: databaseUrl(), max: 10 });
  }
  return instance;
}

export async function closePool() {
  if (instance) {
    await instance.end();
    instance = null;
  }
}

/**
 * Set DEBUG_SQL=1 to print every statement with its timing. Useful when an
 * endpoint feels slower than the work it is doing should justify.
 */
function debugSql() {
  loadEnv();
  return process.env.DEBUG_SQL === "1";
}

/** Runs a parameterised query and returns the rows. */
export async function query<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const startedAt = performance.now();

  try {
    const result = await getPool().query<T>(sql, params);
    return result.rows;
  } finally {
    if (debugSql()) {
      const ms = (performance.now() - startedAt).toFixed(1);
      const flat = sql.replace(/\s+/g, " ").trim().slice(0, 110);
      console.log(`[sql ${ms.padStart(7)}ms] ${flat}`);
    }
  }
}

/** Returns the first row, or null when the query matched nothing. */
export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Runs `fn` inside a transaction, rolling back if it throws. */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}
