import { test } from "node:test";
import assert from "node:assert/strict";

import { createTestDatabase } from "../db/test-database.js";
import { DrizzleIdempotencyStore } from "./drizzle-idempotency-store.js";

test("stores the first result of an operation and keeps it on conflict", async () => {
  const store = new DrizzleIdempotencyStore(await createTestDatabase());

  assert.equal(await store.find("op-1"), undefined);
  assert.deepEqual(await store.save("op-1", "visit.reassign", { employeeId: "e-2" }), { employeeId: "e-2" });
  assert.deepEqual(await store.save("op-1", "visit.reassign", { employeeId: "e-3" }), { employeeId: "e-2" });
  assert.deepEqual(await store.find("op-1"), { employeeId: "e-2" });
});
