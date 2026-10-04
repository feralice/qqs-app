import { test } from "node:test";
import assert from "node:assert/strict";
import type { VisitDetails } from "@qqs/contracts";

import { SyncQueue } from "./sync-queue";
import { createVisitOperationProcessor, syncPending } from "./sync-runner";

const remote = {} as VisitDetails;

function fakeApi(calls: string[], failOn?: string) {
  const record = (name: string) => {
    calls.push(name);
    if (name === failOn) throw new Error("offline");
    return remote;
  };
  return {
    createVisit: async (body: { id?: string }) => record(`create:${body.id}`),
    startVisit: async (id: string) => record(`start:${id}`),
    finishVisit: async (id: string) => record(`finish:${id}`),
  };
}

test("syncPending sends create, start and finish in order", async () => {
  const queue = new SyncQueue();
  await queue.enqueue({ operationId: "c", entityId: "v1", type: "visit.create", payload: { id: "v1", clientId: "client-001", scheduledFor: "2026-10-03T12:00:00.000Z" } });
  await queue.enqueue({ operationId: "s", entityId: "v1", type: "visit.start", payload: { operationId: "s", arrivedAt: "2026-10-03T12:05:00.000Z" } });
  await queue.enqueue({ operationId: "f", entityId: "v1", type: "visit.finish", payload: { operationId: "f", finishedAt: "2026-10-03T13:00:00.000Z" } });
  const calls: string[] = [];

  const result = await syncPending(queue, fakeApi(calls));

  assert.deepEqual(calls, ["create:v1", "start:v1", "finish:v1"]);
  assert.deepEqual(result, { remaining: 0 });
});

test("syncPending reports what is left when the network fails", async () => {
  const queue = new SyncQueue();
  await queue.enqueue({ operationId: "s", entityId: "v1", type: "visit.start", payload: {} });
  await queue.enqueue({ operationId: "f", entityId: "v1", type: "visit.finish", payload: {} });

  const result = await syncPending(queue, fakeApi([], "start:v1"));

  assert.deepEqual(result, { remaining: 2 });
});

test("an unknown operation type fails instead of being marked as synced", async () => {
  const queue = new SyncQueue();
  await queue.enqueue({ operationId: "x", entityId: "v1", type: "visit.unknown", payload: {} });

  await queue.process(createVisitOperationProcessor(fakeApi([])));

  assert.equal(queue.get("x")?.status, "failed");
});
