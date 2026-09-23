import { test } from "node:test";
import assert from "node:assert/strict";

import type { ArrivalLocation, EmployeeSummary, VisitDetails, VisitPhoto } from "@qqs/contracts";

import { SyncQueue } from "../sync/sync-queue.js";
import { VisitStore } from "./visit-store.js";
import { finishVisit } from "./finish-visit.js";

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

const dummyPhoto: VisitPhoto = {
  id: "photo-1",
  uri: "file://photo.jpg",
  caption: "Evidência",
  takenAt: "2026-09-22T14:00:00.000Z",
};

test("finishVisit queues local departure, duration and evidence before remote synchronization", async () => {
  const queue = new SyncQueue();
  const store = new VisitStore();
  store.set(initialVisit);

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
  store.set(initialVisit);

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
