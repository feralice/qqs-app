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

test("processes a visit.start operation and marks it as synced", async () => {
  const queue = new SyncQueue();
  queue.enqueue({
    operationId: "operation-visit-start",
    entityId: "visit-1",
    type: "visit.start",
    payload: { arrivedAt: "2026-09-21T12:00:00.000Z" },
  });

  const processed: string[] = [];
  await queue.process(async (operation) => {
    processed.push(operation.operationId);
  });

  assert.deepEqual(processed, ["operation-visit-start"]);
  assert.equal(queue.pending().length, 0);
  assert.equal(queue.get("operation-visit-start")?.status, "synced");
});

test("keeps a failed operation pending and retries with the same operation id", async () => {
  const queue = new SyncQueue();
  queue.enqueue({
    operationId: "operation-retry",
    entityId: "visit-1",
    type: "visit.start",
    payload: { arrivedAt: "2026-09-21T12:00:00.000Z" },
  });

  await queue.process(async () => {
    throw new Error("offline");
  });
  assert.equal(queue.get("operation-retry")?.status, "failed");

  const retried: string[] = [];
  await queue.process(async (operation) => {
    retried.push(operation.operationId);
  });

  assert.deepEqual(retried, ["operation-retry"]);
  assert.equal(queue.get("operation-retry")?.status, "synced");
  assert.equal(queue.pending().length, 0);
});
