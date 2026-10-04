import { test } from "node:test";
import assert from "node:assert/strict";

import { createMemoryKeyValueStorage } from "./key-value-storage";
import { createMemoryLocalCache, createPersistentLocalCache } from "./local-cache";

test("local cache stores and restores a value", async () => {
  const cache = createMemoryLocalCache();
  await cache.write("dashboard:2026-09-27", { counts: { scheduled: 2 } });

  assert.deepEqual(await cache.read("dashboard:2026-09-27"), { counts: { scheduled: 2 } });
});

test("local cache returns undefined for a missing key", async () => {
  const cache = createMemoryLocalCache();
  assert.equal(await cache.read("missing"), undefined);
});

test("persistent cache survives a new instance over the same storage", async () => {
  const storage = createMemoryKeyValueStorage();
  await createPersistentLocalCache<string[]>(storage, "clients").write("all", ["Gases da Amazônia"]);

  const reopened = createPersistentLocalCache<string[]>(storage, "clients");
  assert.deepEqual(await reopened.read("all"), ["Gases da Amazônia"]);
  assert.equal(await createPersistentLocalCache(storage, "other").read("all"), undefined);
});

test("persistent cache ignores a corrupted entry instead of crashing", async () => {
  const storage = createMemoryKeyValueStorage();
  await storage.setItem("clients:all", "{not json");
  assert.equal(await createPersistentLocalCache(storage, "clients").read("all"), undefined);
});
