import { test } from "node:test";
import assert from "node:assert/strict";

import { createMemoryKeyValueStorage } from "./key-value-storage";
import { ApiError } from "../../shared/http/api-error";
import { SyncQueue } from "./sync-queue";

const startOperation = {
  operationId: "operation-1",
  entityId: "visit-1",
  type: "visit.start",
  payload: { arrivedAt: "2026-09-21T12:00:00.000Z" },
};

test("enqueued operation stays pending until it is confirmed", async () => {
  const queue = new SyncQueue();
  const operation = await queue.enqueue(startOperation);

  assert.equal(operation.status, "pending");
  assert.equal(queue.pending().length, 1);

  const confirmed = await queue.confirm("operation-1");
  assert.equal(confirmed.status, "synced");
  assert.equal(queue.pending().length, 0);
});

test("re-enqueuing the same operation identifier does not duplicate it", async () => {
  const queue = new SyncQueue();
  const first = await queue.enqueue(startOperation);
  const second = await queue.enqueue(startOperation);

  assert.deepEqual(second, first);
  assert.equal(queue.pending().length, 1);
});

test("processes an operation and marks it as synced", async () => {
  const queue = new SyncQueue();
  await queue.enqueue(startOperation);

  const processed: string[] = [];
  await queue.process(async (operation) => {
    processed.push(operation.operationId);
  });

  assert.deepEqual(processed, ["operation-1"]);
  assert.equal(queue.pending().length, 0);
  assert.equal(queue.get("operation-1")?.status, "synced");
});

test("keeps a failed operation pending and retries with the same operation id", async () => {
  const queue = new SyncQueue();
  await queue.enqueue(startOperation);

  await queue.process(async () => {
    throw new Error("offline");
  });
  assert.equal(queue.get("operation-1")?.status, "failed");

  const retried: string[] = [];
  await queue.process(async (operation) => {
    retried.push(operation.operationId);
  });

  assert.deepEqual(retried, ["operation-1"]);
  assert.equal(queue.pending().length, 0);
});

test("process stops at the first failure and keeps the order", async () => {
  const queue = new SyncQueue();
  await queue.enqueue({ ...startOperation, operationId: "start" });
  await queue.enqueue({ ...startOperation, operationId: "finish", type: "visit.finish" });

  const sent: string[] = [];
  await queue.process(async (operation) => {
    sent.push(operation.operationId);
    throw new Error("offline");
  });

  assert.deepEqual(sent, ["start"]);
  assert.equal(queue.get("finish")?.status, "pending");
  assert.deepEqual(queue.pending().map((operation) => operation.operationId), ["start", "finish"]);
});

test("queue restores pending operations after the app restarts", async () => {
  const storage = createMemoryKeyValueStorage();
  const first = await SyncQueue.open(storage);
  await first.enqueue(startOperation);

  const reopened = await SyncQueue.open(storage);
  assert.deepEqual(reopened.pending().map((operation) => operation.operationId), ["operation-1"]);
});

test("an operation interrupted while syncing is retried after restart", async () => {
  const storage = createMemoryKeyValueStorage();
  const queue = await SyncQueue.open(storage);
  await queue.enqueue(startOperation);
  void queue.process(() => new Promise(() => {}));
  await new Promise((resolve) => setImmediate(resolve));

  const reopened = await SyncQueue.open(storage);
  assert.equal(reopened.get("operation-1")?.status, "failed");
  assert.equal(reopened.pending().length, 1);
});

test("confirmed operations are not kept forever on the device", async () => {
  const storage = createMemoryKeyValueStorage();
  const queue = await SyncQueue.open(storage);
  await queue.enqueue(startOperation);
  await queue.process(async () => {});

  const reopened = await SyncQueue.open(storage);
  assert.equal(reopened.get("operation-1"), undefined);
});

test("concurrent process calls never send a dependent operation early", async () => {
  const queue = new SyncQueue();
  await queue.enqueue({ ...startOperation, operationId: "start" });
  await queue.enqueue({ ...startOperation, operationId: "finish", type: "visit.finish" });

  let releaseStart!: () => void;
  const sent: string[] = [];
  const processor = async (operation: { operationId: string }) => {
    sent.push(operation.operationId);
    if (operation.operationId === "start") {
      await new Promise<void>((resolve) => {
        releaseStart = resolve;
      });
      throw new Error("offline");
    }
  };

  const first = queue.process(processor);
  await new Promise((resolve) => setImmediate(resolve));
  const second = queue.process(processor);
  releaseStart();
  await Promise.all([first, second]);

  assert.deepEqual(sent, ["start"]);
  assert.equal(queue.get("finish")?.status, "pending");
});

test("a rejected operation is set aside and other visits keep syncing", async () => {
  const queue = new SyncQueue();
  await queue.enqueue({ operationId: "a-start", entityId: "visit-a", type: "visit.start", payload: {} });
  await queue.enqueue({ operationId: "a-finish", entityId: "visit-a", type: "visit.finish", payload: {} });
  await queue.enqueue({ operationId: "b-start", entityId: "visit-b", type: "visit.start", payload: {} });

  const sent: string[] = [];
  await queue.process(async (operation) => {
    sent.push(operation.operationId);
    if (operation.operationId === "a-start") throw new ApiError(422);
  });

  assert.deepEqual(sent, ["a-start", "b-start"]);
  assert.equal(queue.get("a-start")?.status, "rejected");
  assert.equal(queue.get("a-finish")?.status, "pending");
  assert.equal(queue.get("b-start")?.status, "synced");
  assert.deepEqual(queue.rejected().map((operation) => operation.operationId), ["a-start"]);
  assert.deepEqual(queue.pending().map((operation) => operation.operationId), ["a-finish"]);
});

test("an expired session is retried later instead of rejected", async () => {
  const queue = new SyncQueue();
  await queue.enqueue(startOperation);
  await queue.process(async () => {
    throw new ApiError(401);
  });
  assert.equal(queue.get("operation-1")?.status, "failed");
});

test("rejected operations survive a restart", async () => {
  const storage = createMemoryKeyValueStorage();
  const queue = await SyncQueue.open(storage);
  await queue.enqueue(startOperation);
  await queue.process(async () => {
    throw new ApiError(404);
  });

  assert.equal((await SyncQueue.open(storage)).rejected().length, 1);
});
