import { test } from "node:test";
import assert from "node:assert/strict";
import type { VisitDetails } from "@qqs/contracts";

import { createMemoryKeyValueStorage } from "../sync/key-value-storage";
import { VisitStore } from "./visit-store";

const visit: VisitDetails = {
  id: "visit-001",
  clientId: "client-001",
  clientName: "Gases da Amazônia",
  scheduledFor: "2026-09-21T13:00:00.000Z",
  status: "assigned",
  systemsCount: 0,
  systems: [],
  syncStatus: "synced",
};

test("visit store survives a restart", async () => {
  const storage = createMemoryKeyValueStorage();
  const store = await VisitStore.open(storage);
  await store.set(visit);

  const reopened = await VisitStore.open(storage);
  assert.equal(reopened.get("visit-001")?.clientName, "Gases da Amazônia");
});

test("setAll replaces server data but keeps visits with operations still in the queue", async () => {
  const store = await VisitStore.open(createMemoryKeyValueStorage());
  await store.set({ ...visit, id: "local", status: "in_progress", syncStatus: "pending" });
  await store.set({ ...visit, id: "stale" });

  await store.setAll([{ ...visit, id: "local", status: "assigned" }, { ...visit, id: "new" }], ["local"]);

  assert.equal(store.get("local")?.status, "in_progress");
  assert.equal(store.get("stale"), undefined);
  assert.equal(store.get("new")?.clientName, "Gases da Amazônia");
});

test("setAll keeps a visit created offline that the server does not know yet", async () => {
  const store = await VisitStore.open(createMemoryKeyValueStorage());
  await store.set({ ...visit, id: "offline", syncStatus: "pending" });

  await store.setAll([], ["offline"]);

  assert.equal(store.get("offline")?.syncStatus, "pending");
});

test("setAll takes the server copy once nothing is left in the queue", async () => {
  const store = await VisitStore.open(createMemoryKeyValueStorage());
  await store.set({ ...visit, id: "sent", status: "in_progress", syncStatus: "pending" });

  await store.setAll([{ ...visit, id: "sent", status: "in_progress" }]);

  assert.equal(store.get("sent")?.syncStatus, "synced");
});
