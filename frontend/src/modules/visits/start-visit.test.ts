import { test } from "node:test";
import assert from "node:assert/strict";

import { SyncQueue } from "../sync/sync-queue.js";
import type { LocationProvider } from "../location/location-provider.js";
import { startVisit } from "./start-visit.js";
import { VisitStore } from "./visit-store.js";

test("startVisit queues local arrival before remote synchronization", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  store.set({
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-21T13:00:00.000Z",
    status: "assigned",
    systemsCount: 0,
    systems: [],
    syncStatus: "pending",
  });
  const calls: unknown[] = [];
  const locationProvider: LocationProvider = {
    getArrivalLocation: async () => ({
      status: "granted",
      location: { latitude: -3.119, longitude: -60.021 },
    }),
  };

  const result = await startVisit({
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "employee-001",
    now: "2026-09-21T13:15:00.000Z",
    locationProvider,
    queue,
    store,
    api: {
      startVisit: async (visitId, payload) => {
        calls.push({ visitId, payload });
        return store.get(visitId)!;
      },
    },
  });

  assert.equal(result.locationStatus, "granted");
  assert.equal(store.get("visit-001")?.status, "in_progress");
  assert.equal(queue.pending().length, 0);
  assert.equal(calls.length, 1);
});

test("startVisit preserves local arrival when remote synchronization fails", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  store.set({
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-21T13:00:00.000Z",
    status: "assigned",
    systemsCount: 0,
    systems: [],
    syncStatus: "pending",
  });
  const locationProvider: LocationProvider = {
    getArrivalLocation: async () => ({ status: "denied" }),
  };

  const result = await startVisit({
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "employee-001",
    now: "2026-09-21T13:15:00.000Z",
    locationProvider,
    queue,
    store,
    api: {
      startVisit: async () => {
        throw new Error("offline");
      },
    },
  });

  assert.equal(result.locationStatus, "denied");
  assert.equal(result.syncStatus, "pending");
  assert.equal(store.get("visit-001")?.status, "in_progress");
  assert.equal(queue.pending().length, 1);
});
