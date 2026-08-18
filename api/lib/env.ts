import fs from "node:fs";
import path from "node:path";

let loaded = false;

/** Finds the nearest .env, walking up from the working directory. */
function findEnvFile(): string | null {
  let dir = process.cwd();

  for (let depth = 0; depth < 4; depth += 1) {
    const candidate = path.join(dir, ".env");
    if (fs.existsSync(candidate)) return candidate;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

export function loadEnv() {
  if (loaded) return;
  const file = findEnvFile();
  if (file) process.loadEnvFile(file);
  loaded = true;
}

export function databaseUrl(): string {
  loadEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set.\n" +
        "Copy .env.example to .env at the repository root, then run `docker compose up -d`.",
    );
    process.exit(1);
  }

  return url;
}

export function apiPort(): number {
  loadEnv();
  return Number(process.env.API_PORT ?? 4000);
}
