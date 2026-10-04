import { test } from "node:test";
import assert from "node:assert/strict";

import { createTestDatabase } from "../../../shared/db/test-database.js";
import type { User } from "../domain/user.js";
import { DrizzleRefreshTokenRepository } from "./drizzle-refresh-token-repository.js";
import { DrizzleUserRepository } from "./drizzle-user-repository.js";

const ana: User = {
  id: "user-ana",
  name: "Ana",
  email: "ana@qqs.app",
  passwordHash: "hash",
  role: "employee",
  active: true,
};

test("user repository saves and finds a user by email and id", async () => {
  const users = new DrizzleUserRepository(await createTestDatabase());
  await users.save(ana);

  assert.deepEqual(await users.findByEmail("ana@qqs.app"), ana);
  assert.deepEqual(await users.findById("user-ana"), ana);
  assert.equal(await users.findByEmail("ninguem@qqs.app"), undefined);
});

test("user repository save updates an existing user", async () => {
  const users = new DrizzleUserRepository(await createTestDatabase());
  await users.save(ana);
  await users.save({ ...ana, name: "Ana Paula", active: false });

  const list = await users.list();
  assert.equal(list.length, 1);
  assert.equal(list[0].name, "Ana Paula");
  assert.equal(list[0].active, false);
});

test("user repository lists users ordered by name", async () => {
  const users = new DrizzleUserRepository(await createTestDatabase());
  await users.save({ ...ana, id: "u-2", email: "z@qqs.app", name: "Zélia" });
  await users.save({ ...ana, id: "u-1", email: "b@qqs.app", name: "Bruno" });

  assert.deepEqual((await users.list()).map((user) => user.name), ["Bruno", "Zélia"]);
});

test("refresh token repository saves, finds and revokes", async () => {
  const db = await createTestDatabase();
  await new DrizzleUserRepository(db).save(ana);
  const tokens = new DrizzleRefreshTokenRepository(db);
  const entry = { userId: "user-ana", expiresAt: "2026-10-10T12:00:00.000Z" };

  await tokens.save("token-1", entry);
  assert.deepEqual(await tokens.find("token-1"), entry);

  await tokens.revoke("token-1");
  assert.equal(await tokens.find("token-1"), undefined);
});
