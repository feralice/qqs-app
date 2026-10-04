import { test } from "node:test";
import assert from "node:assert/strict";

import { createTestDatabase } from "../../../shared/db/test-database.js";
import { seedDevelopmentData } from "../../../shared/db/seed.js";
import { DrizzleVisitRepository } from "./drizzle-visit-repository.js";

async function repository() {
  const db = await createTestDatabase();
  await seedDevelopmentData(db);
  return new DrizzleVisitRepository(db);
}

test("findById joins client name, address, location and systems", async () => {
  const visit = await (await repository()).findById("visit-001");

  assert.equal(visit?.clientName, "Gases da Amazônia");
  assert.equal(visit?.clientAddress, "Manaus, AM");
  assert.deepEqual(visit?.clientLocation, { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 });
  assert.deepEqual(visit?.systems?.map((system) => system.name), ["Caldeira 1", "Torre 1", "Torre 2"]);
  assert.equal(visit?.scheduledFor, "2026-09-21T13:00:00.000Z");
});

test("save round-trips arrival, departure, attendants and photos", async () => {
  const repo = await repository();
  const current = await repo.findById("visit-001");
  const saved = await repo.save({
    ...current!,
    status: "completed",
    arrivedAt: "2026-09-21T13:05:00.000Z",
    arrivalLocation: { latitude: -3.119, longitude: -60.021, accuracy: 12.5 },
    arrivalDistanceMeters: 1953,
    outsideRadius: true,
    arrivalJustification: "Portaria afastada",
    lastStartOperationId: "op-start",
    leftAt: "2026-09-21T14:05:00.000Z",
    finishedAt: "2026-09-21T14:05:00.000Z",
    departureLocation: { latitude: -3.1, longitude: -60.02 },
    durationMinutes: 60,
    description: "Limpeza da torre",
    attendants: [{ id: "employee-002", name: "Carlos Silva", email: "carlos.silva@qqs.app", role: "employee" }],
    photos: [{ id: "p-1", uri: "file:///foto.jpg", takenAt: "2026-09-21T13:30:00.000Z" }],
    lastFinishOperationId: "op-finish",
  });

  assert.equal(saved.clientName, "Gases da Amazônia");
  assert.equal(saved.arrivalJustification, "Portaria afastada");
  assert.equal(saved.outsideRadius, true);
  assert.equal(saved.attendants?.[0].name, "Carlos Silva");
  assert.equal(saved.photos?.[0].uri, "file:///foto.jpg");
  assert.equal(saved.leftAt, "2026-09-21T14:05:00.000Z");
  assert.equal((await repo.findByStartOperationId("op-start"))?.id, "visit-001");
  assert.equal((await repo.findByFinishOperationId("op-finish"))?.id, "visit-001");
});

test("list filters by employee", async () => {
  const repo = await repository();
  assert.equal((await repo.list()).length, 1);
  assert.equal((await repo.list({ employeeId: "employee-001" })).length, 1);
  assert.equal((await repo.list({ employeeId: "employee-002" })).length, 0);
});

test("unknown visit returns undefined", async () => {
  assert.equal(await (await repository()).findById("missing"), undefined);
});
