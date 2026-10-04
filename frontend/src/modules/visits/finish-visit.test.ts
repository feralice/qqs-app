import { test } from "node:test";
import assert from "node:assert/strict";

import type { ArrivalLocation, EmployeeSummary, VisitDetails, VisitPhoto } from "@qqs/contracts";

import { SyncQueue } from "../sync/sync-queue";
import { VisitStore } from "./visit-store";
import { finishVisit } from "./finish-visit";

const initialVisit: VisitDetails = {
  id: "visit-001",
  clientId: "client-001",
  clientName: "Gases da Amazônia",
  scheduledFor: "2026-09-22T13:00:00.000Z",
  status: "in_progress",
  systemsCount: 1,
  systems: [{ id: "system-001", name: "Torre 1", type: "tower" }],
  arrival: {
    arrivedAt: "2026-09-22T13:10:00.000Z",
    location: { latitude: -3.1019, longitude: -60.025 },
  },
  syncStatus: "synced",
};

const dummyAttendant: EmployeeSummary = {
  id: "emp-2",
  name: "Carlos Técnico",
  email: "carlos@qqs.com",
  role: "employee",
};

const unusedSyncCalls = {
  createVisit: async () => initialVisit,
  startVisit: async () => initialVisit,
};

const dummyPhoto: VisitPhoto = {
  id: "photo-1",
  uri: "file://photo.jpg",
  caption: "Evidência",
  takenAt: "2026-09-22T14:00:00.000Z",
};

test("finishVisit queues local departure, duration and evidence before remote synchronization", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  await store.set(initialVisit);

  const departureLocation: ArrivalLocation = {
    latitude: -3.1025,
    longitude: -60.026,
    accuracy: 6,
  };

  let remoteCalledWith: unknown;

  const result = await finishVisit({
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "employee-001",
    now: "2026-09-22T14:40:00.000Z",
    description: "Limpeza química concluída.",
    attendants: [dummyAttendant],
    photos: [dummyPhoto],
    locationProvider: {
      getArrivalLocation: async () => ({
        status: "granted",
        location: departureLocation,
      }),
    },
    queue,
    store,
    api: {
      ...unusedSyncCalls,
      finishVisit: async (_id, request) => {
        remoteCalledWith = request;
        return {
          ...initialVisit,
          status: "completed",
          finishedAt: request.finishedAt,
          departure: { leftAt: request.finishedAt, location: request.location },
          description: request.description,
          attendants: request.attendants,
          photos: request.photos,
          durationMinutes: 90,
          syncStatus: "synced",
        };
      },
    },
  });

  assert.equal(result.syncStatus, "synced");
  assert.equal(result.locationStatus, "granted");
  assert.equal(result.visit.status, "completed");
  assert.equal(result.visit.durationMinutes, 90);
  assert.equal(result.visit.departure?.location?.latitude, -3.1025);
  assert.equal(result.visit.description, "Limpeza química concluída.");
  assert.equal(result.visit.attendants?.length, 1);
  assert.equal(result.visit.photos?.length, 1);

  const stored = store.get("visit-001");
  assert.equal(stored?.status, "completed");
  assert.equal(stored?.syncStatus, "synced");
  assert.ok(remoteCalledWith);
});

test("finishVisit preserves local completion when remote synchronization fails", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  await store.set(initialVisit);

  const result = await finishVisit({
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "employee-001",
    now: "2026-09-22T14:40:00.000Z",
    description: "Finalização sem sinal de internet",
    attendants: [dummyAttendant],
    photos: [],
    locationProvider: {
      getArrivalLocation: async () => ({ status: "denied" }),
    },
    queue,
    store,
    api: {
      ...unusedSyncCalls,
      finishVisit: async () => {
        throw new Error("network offline");
      },
    },
  });

  assert.equal(result.syncStatus, "pending");
  assert.equal(result.locationStatus, "denied");
  assert.equal(result.visit.status, "completed");
  assert.equal(result.visit.durationMinutes, 90);

  const stored = store.get("visit-001");
  assert.equal(stored?.status, "completed");
  assert.equal(stored?.syncStatus, "pending");
  assert.equal(stored?.description, "Finalização sem sinal de internet");

  const pendingOps = queue.pending();
  assert.equal(pendingOps.length, 1);
  assert.equal(pendingOps[0].type, "visit.finish");
});

test("finishVisit sends a check-in still waiting in the queue before the check-out", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  await store.set(initialVisit);
  await queue.enqueue({ operationId: "start-offline", entityId: "visit-001", type: "visit.start", payload: {} });
  const calls: string[] = [];

  const result = await finishVisit({
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "employee-001",
    now: "2026-09-22T14:40:00.000Z",
    locationProvider: { getArrivalLocation: async () => ({ status: "denied" }) },
    queue,
    store,
    api: {
      createVisit: async () => initialVisit,
      startVisit: async () => {
        calls.push("start");
        return initialVisit;
      },
      finishVisit: async () => {
        calls.push("finish");
        return { ...initialVisit, status: "completed" as const };
      },
    },
  });

  assert.deepEqual(calls, ["start", "finish"]);
  assert.equal(result.syncStatus, "synced");
  assert.equal(queue.pending().length, 0);
});

test("finishVisit stays local when the queued check-in cannot be sent", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  await store.set(initialVisit);
  await queue.enqueue({ operationId: "start-offline", entityId: "visit-001", type: "visit.start", payload: {} });
  const calls: string[] = [];

  const result = await finishVisit({
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "employee-001",
    now: "2026-09-22T14:40:00.000Z",
    locationProvider: { getArrivalLocation: async () => ({ status: "denied" }) },
    queue,
    store,
    api: {
      createVisit: async () => initialVisit,
      startVisit: async () => {
        throw new Error("offline");
      },
      finishVisit: async () => {
        calls.push("finish");
        return initialVisit;
      },
    },
  });

  assert.deepEqual(calls, []);
  assert.equal(result.syncStatus, "pending");
  assert.equal(store.get("visit-001")?.status, "completed");
});
