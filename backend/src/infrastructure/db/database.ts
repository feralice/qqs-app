import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import * as schema from "./schema.js";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export type OpenDatabase = {
  db: Database;
  close(): Promise<void>;
};

const MIGRATIONS_FOLDER = fileURLToPath(new URL("../../../drizzle", import.meta.url));

// Sem DATABASE_URL o backend usa PGlite (Postgres em WASM): mesmos tipos e SQL,
// sem depender de Docker no desenvolvimento e nos testes.
export async function openDatabase(config: { url?: string; dataDir?: string }): Promise<OpenDatabase> {
  if (config.url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: config.url });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    return { db: db as unknown as Database, close: () => pool.end() };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  // PGlite cria apenas o último nível do caminho; num clone novo `.data` ainda não existe.
  if (config.dataDir) mkdirSync(config.dataDir, { recursive: true });
  const client = new PGlite(config.dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return { db: db as unknown as Database, close: () => client.close() };
}
