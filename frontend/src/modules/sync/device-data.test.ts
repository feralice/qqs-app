import { test } from "node:test";
import assert from "node:assert/strict";

import { createMemoryKeyValueStorage } from "./key-value-storage";
import { openDeviceData } from "./device-data";

test("each technician gets their own visits and queue on a shared device", async () => {
  const storage = createMemoryKeyValueStorage();
  const ana = await openDeviceData(storage, "employee-001");
  await ana.queue.enqueue({ operationId: "op", entityId: "visit-1", type: "visit.start", payload: {} });
  await ana.store.set({
    id: "visit-1",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-10-04T12:00:00.000Z",
    status: "in_progress",
    systemsCount: 0,
    systems: [],
    syncStatus: "pending",
  });

  const bruno = await openDeviceData(storage, "employee-002");
  assert.equal(bruno.queue.pending().length, 0);
  assert.equal(bruno.store.list().length, 0);

  const anaAgain = await openDeviceData(storage, "employee-001");
  assert.equal(anaAgain.queue.pending().length, 1);
  assert.equal(anaAgain.store.get("visit-1")?.clientName, "Gases da Amazônia");
});
