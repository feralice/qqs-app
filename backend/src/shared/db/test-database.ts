import { sql } from "drizzle-orm";

import { openDatabase, type Database } from "./database.js";

// PGlite leva ~1,5 s para subir; um banco por processo de teste, zerado a cada chamada.
let shared: Promise<Database> | undefined;

export async function createTestDatabase(): Promise<Database> {
  shared ??= openDatabase({}).then((opened) => opened.db);
  const db = await shared;
  await db.execute(
    sql`TRUNCATE visits, client_systems, clients, refresh_tokens, users RESTART IDENTITY CASCADE`,
  );
  return db;
}
