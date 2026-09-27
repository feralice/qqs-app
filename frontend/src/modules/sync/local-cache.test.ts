import { test } from "node:test";
import assert from "node:assert/strict";

import { createMemoryLocalCache } from "./local-cache";

test("local cache stores and restores a value", async () => {
  const cache = createMemoryLocalCache();
  await cache.write("dashboard:2026-09-27", { counts: { scheduled: 2 } });

  assert.deepEqual(await cache.read("dashboard:2026-09-27"), { counts: { scheduled: 2 } });
});

test("local cache returns undefined for a missing key", async () => {
  const cache = createMemoryLocalCache();
  assert.equal(await cache.read("missing"), undefined);
});
