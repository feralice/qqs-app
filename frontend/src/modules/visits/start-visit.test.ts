import { test } from "node:test";
import assert from "node:assert/strict";
import type { StartVisitRequest, VisitDetails } from "@qqs/contracts";

import { SyncQueue } from "../sync/sync-queue";
import type { ArrivalEvaluation } from "./arrival";
import { startVisit } from "./start-visit";
import { VisitStore } from "./visit-store";

const assigned: VisitDetails = {
  id: "visit-001",
  clientId: "client-001",
  clientName: "Gases da Amazônia",
  scheduledFor: "2026-09-21T13:00:00.000Z",
  status: "assigned",
  systemsCount: 0,
  systems: [],
  syncStatus: "synced",
};

const outside: ArrivalEvaluation = {
  location: { latitude: -3.119, longitude: -60.021 },
  locationStatus: "granted",
  distanceMeters: 1953,
  outsideRadius: true,
};

const otherSyncCalls = {
  createVisit: async () => assigned,
  finishVisit: async () => assigned,
};

async function setup() {
  const store = new VisitStore();
  await store.set(assigned);
  return { store, queue: new SyncQueue() };
}

test("startVisit sends the justification and stores the radius result locally", async () => {
  const { store, queue } = await setup();
  const sent: StartVisitRequest[] = [];

  const result = await startVisit({
    visitId: "visit-001",
    now: "2026-09-21T13:15:00.000Z",
    arrival: outside,
    justification: "Portaria afastada",
    queue,
    store,
    api: {
      ...otherSyncCalls,
      startVisit: async (_id, payload) => {
        sent.push(payload);
        return store.get("visit-001")!;
      },
    },
  });

  assert.equal(result.syncStatus, "synced");
  assert.equal(sent[0].justification, "Portaria afastada");
  assert.deepEqual(sent[0].location, outside.location);
  const stored = store.get("visit-001");
  assert.equal(stored?.status, "in_progress");
  assert.deepEqual(stored?.arrival, {
    arrivedAt: "2026-09-21T13:15:00.000Z",
    location: outside.location,
    distanceMeters: 1953,
    outsideRadius: true,
    justification: "Portaria afastada",
  });
  assert.equal(stored?.syncStatus, "synced");
  assert.equal(queue.pending().length, 0);
});

test("startVisit keeps the arrival queued with its justification when offline", async () => {
  const { store, queue } = await setup();

  const result = await startVisit({
    visitId: "visit-001",
    now: "2026-09-21T13:15:00.000Z",
    arrival: { locationStatus: "denied", outsideRadius: true },
    justification: "GPS sem sinal",
    queue,
    store,
    api: {
      ...otherSyncCalls,
      startVisit: async () => {
        throw new Error("offline");
      },
    },
  });

  assert.equal(result.syncStatus, "pending");
  assert.equal(store.get("visit-001")?.status, "in_progress");
  assert.equal(store.get("visit-001")?.syncStatus, "pending");
  const [operation] = queue.pending();
  assert.equal(operation.type, "visit.start");
  assert.equal(operation.payload.justification, "GPS sem sinal");
});

test("startVisit refuses an out-of-radius arrival without justification", async () => {
  const { store, queue } = await setup();

  await assert.rejects(
    startVisit({
      visitId: "visit-001",
      now: "2026-09-21T13:15:00.000Z",
      arrival: outside,
      justification: "  ",
      queue,
      store,
      api: { ...otherSyncCalls, startVisit: async () => assigned },
    }),
    /justification required/,
  );
  assert.equal(queue.pending().length, 0);
  assert.equal(store.get("visit-001")?.status, "assigned");
});

test("startVisit on a visit created offline sends the creation first", async () => {
  const { store, queue } = await setup();
  await queue.enqueue({ operationId: "create", entityId: "visit-001", type: "visit.create", payload: { id: "visit-001" } });
  const calls: string[] = [];

  await startVisit({
    visitId: "visit-001",
    now: "2026-09-21T13:15:00.000Z",
    arrival: { ...outside, outsideRadius: false },
    queue,
    store,
    api: {
      createVisit: async () => {
        calls.push("create");
        return assigned;
      },
      startVisit: async () => {
        calls.push("start");
        return assigned;
      },
      finishVisit: async () => assigned,
    },
  });

  assert.deepEqual(calls, ["create", "start"]);
});
