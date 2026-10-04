import { test } from "node:test";
import assert from "node:assert/strict";
import type { ClientSummary, CreateVisitRequest, VisitDetails } from "@qqs/contracts";

import { sampleClients } from "../clients/client-fixtures";
import { createMemoryKeyValueStorage } from "../sync/key-value-storage";
import { createPersistentLocalCache } from "../sync/local-cache";
import { SyncQueue } from "../sync/sync-queue";
import { ApiError } from "../../shared/http/api-error";
import { VisitStore } from "./visit-store";
import { createOfflineVisit, refreshTechnicianData } from "./technician-data";

const serverVisit: VisitDetails = {
  id: "visit-001",
  clientId: "client-001",
  clientName: "Gases da Amazônia",
  scheduledFor: "2026-09-21T13:00:00.000Z",
  status: "assigned",
  systemsCount: 0,
  systems: [],
  syncStatus: "synced",
};

async function setup() {
  const storage = createMemoryKeyValueStorage();
  return {
    queue: await SyncQueue.open(storage),
    store: await VisitStore.open(storage),
    clientsCache: createPersistentLocalCache<ClientSummary[]>(storage, "clients"),
  };
}

function onlineApi(created: CreateVisitRequest[] = []) {
  return {
    visitApi: {
      listVisits: async () => [serverVisit],
      createVisit: async (body: CreateVisitRequest) => {
        created.push(body);
        return serverVisit;
      },
      startVisit: async () => serverVisit,
      finishVisit: async () => serverVisit,
    },
    clientApi: { listClients: async () => sampleClients },
  };
}

const offline = {
  visitApi: {
    listVisits: async (): Promise<VisitDetails[]> => {
      throw new Error("offline");
    },
    createVisit: async (): Promise<VisitDetails> => {
      throw new Error("offline");
    },
    startVisit: async (): Promise<VisitDetails> => {
      throw new Error("offline");
    },
    finishVisit: async (): Promise<VisitDetails> => {
      throw new Error("offline");
    },
  },
  clientApi: {
    listClients: async (): Promise<ClientSummary[]> => {
      throw new Error("offline");
    },
  },
};

test("refresh online stores server visits and caches companies", async () => {
  const deps = await setup();
  const result = await refreshTechnicianData({ ...deps, ...onlineApi() });

  assert.deepEqual(result.visits.map((visit) => visit.id), ["visit-001"]);
  assert.equal(result.clients.length, 2);
  assert.equal(result.pendingSyncCount, 0);
  assert.equal(result.online, true);
  assert.equal((await deps.clientsCache.read("all"))?.length, 2);
});

test("refresh offline falls back to what is saved on the device", async () => {
  const deps = await setup();
  await refreshTechnicianData({ ...deps, ...onlineApi() });

  const result = await refreshTechnicianData({ ...deps, ...offline });

  assert.equal(result.online, false);
  assert.deepEqual(result.visits.map((visit) => visit.id), ["visit-001"]);
  assert.equal(result.clients.length, 2);
});

test("a visit created offline is shown at once and sent once the network returns", async () => {
  const deps = await setup();
  const visit = await createOfflineVisit({
    ...deps,
    employeeId: "employee-001",
    draft: { client: sampleClients[0], scheduledFor: "2026-10-03T12:00:00.000Z" },
  });

  assert.equal(visit.syncStatus, "pending");
  assert.deepEqual(visit.clientLocation, { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 });
  assert.equal(visit.systemsCount, 1);
  assert.equal(deps.store.get(visit.id)?.clientName, "Gases da Amazônia");

  const stillOffline = await refreshTechnicianData({ ...deps, ...offline });
  assert.equal(stillOffline.pendingSyncCount, 1);
  assert.ok(stillOffline.visits.some((item) => item.id === visit.id));

  const created: CreateVisitRequest[] = [];
  const online = await refreshTechnicianData({ ...deps, ...onlineApi(created) });
  assert.deepEqual(created, [{ id: visit.id, clientId: "client-001", scheduledFor: "2026-10-03T12:00:00.000Z" }]);
  assert.equal(online.pendingSyncCount, 0);
});

test("a check-in made while the list is downloading is not overwritten", async () => {
  const deps = await setup();
  await deps.store.set(serverVisit);
  let releaseList!: (items: VisitDetails[]) => void;
  const api = onlineApi();
  api.visitApi.listVisits = () => new Promise<VisitDetails[]>((resolve) => {
    releaseList = resolve;
  });

  const refreshing = refreshTechnicianData({ ...deps, ...api });
  await new Promise((resolve) => setImmediate(resolve));
  await deps.store.set({ ...serverVisit, status: "in_progress", syncStatus: "pending" });
  await deps.queue.enqueue({ operationId: "start", entityId: "visit-001", type: "visit.start", payload: {} });
  releaseList([serverVisit]);
  await refreshing;

  assert.equal(deps.store.get("visit-001")?.status, "in_progress");
});

test("a visit whose operation the server rejected stays visible and is counted", async () => {
  const deps = await setup();
  await deps.store.set({ ...serverVisit, status: "in_progress", syncStatus: "pending" });
  await deps.queue.enqueue({ operationId: "start", entityId: "visit-001", type: "visit.start", payload: {} });
  const api = onlineApi();
  api.visitApi.startVisit = async () => {
    throw new ApiError(422);
  };

  const result = await refreshTechnicianData({ ...deps, ...api });

  assert.equal(result.rejectedSyncCount, 1);
  assert.equal(result.pendingSyncCount, 0);
  assert.equal(deps.store.get("visit-001")?.status, "in_progress");
});
