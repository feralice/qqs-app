import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { openDatabase } from "./database.js";
import { createTestDatabase } from "./test-database.js";
import { seedDevelopmentData } from "./seed.js";
import { clientSystems, clients, users, visits } from "./schema.js";

test("migrated database starts empty and seed fills users, client and visit", async () => {
  const db = await createTestDatabase();
  assert.equal((await db.select().from(users)).length, 0);

  await seedDevelopmentData(db);

  assert.equal((await db.select().from(users)).length, 5);
  const [client] = await db.select().from(clients);
  assert.equal(client.radiusMeters, 200);
  assert.equal((await db.select().from(clientSystems)).length, 3);
  assert.equal((await db.select().from(visits))[0].id, "visit-001");
});

test("seeding twice does not duplicate data", async () => {
  const db = await createTestDatabase();
  await seedDevelopmentData(db);
  await seedDevelopmentData(db);
  assert.equal((await db.select().from(users)).length, 5);
});

test("createTestDatabase truncates data between calls", async () => {
  const first = await createTestDatabase();
  await seedDevelopmentData(first);
  const second = await createTestDatabase();
  assert.equal((await second.select().from(users)).length, 0);
});

test("openDatabase creates missing parent folders of the PGlite data dir", async () => {
  const root = mkdtempSync(join(tmpdir(), "qqs-db-"));
  const dataDir = join(root, ".data", "pglite");
  try {
    const opened = await openDatabase({ dataDir });
    await opened.close();
    assert.ok(existsSync(dataDir));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
