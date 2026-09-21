import { test } from "node:test";
import assert from "node:assert/strict";

import { SyncQueue } from "./sync-queue.js";

test("enqueued operation stays pending until it is confirmed", () => {
  const queue = new SyncQueue();

  const operation = queue.enqueue({
    operationId: "operation-1",
    entityId: "visit-1",
    type: "visit.started",
    payload: { clientId: "client-1" },
  });

  assert.equal(operation.status, "pending");
  assert.equal(queue.pending().length, 1);

  const confirmed = queue.confirm("operation-1");
  assert.equal(confirmed.status, "synced");
  assert.equal(queue.pending().length, 0);
});

test("re-enqueuing the same operation identifier does not duplicate it", () => {
  const queue = new SyncQueue();
  const input = {
    operationId: "operation-1",
    entityId: "visit-1",
    type: "visit.started",
    payload: { clientId: "client-1" },
  };

  const first = queue.enqueue(input);
  const second = queue.enqueue(input);

  assert.deepEqual(second, first);
  assert.equal(queue.pending().length, 1);
});
