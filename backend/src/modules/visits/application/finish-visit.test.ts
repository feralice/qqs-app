import { test } from "node:test";
import assert from "node:assert/strict";

import { finishVisit } from "./finish-visit.js";
import { InMemoryVisitRepository } from "../infrastructure/in-memory-visit-repository.js";
import type { Visit } from "../domain/visit.js";

test("finishVisit records departure location, duration, description, attendants and photos", async () => {
  const repository = new InMemoryVisitRepository();
  const initialVisit: Visit = {
    id: "visit-001",
    clientId: "client-001",
    employeeId: "emp-1",
    status: "in_progress",
    scheduledFor: "2026-09-22T13:00:00.000Z",
    arrivedAt: "2026-09-22T13:00:00.000Z",
    arrivalLocation: { latitude: -3.1, longitude: -60.0 },
    lastStartOperationId: "op-start-1",
  };
  await repository.save(initialVisit);

  const updated = await finishVisit(repository, {
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "emp-1",
    operationId: "op-finish-1",
    finishedAt: "2026-09-22T14:30:00.000Z",
    location: { latitude: -3.1005, longitude: -60.0005, accuracy: 5 },
    description: "Revisão e limpeza dos sistemas finalizada com sucesso.",
    attendants: [{ id: "emp-2", name: "Marcos", email: "marcos@qqs.com", role: "employee" }],
    photos: [{ id: "p1", uri: "file://photo1.jpg", caption: "Antes", takenAt: "2026-09-22T13:15:00.000Z" }],
  });

  assert.equal(updated.status, "completed");
  assert.equal(updated.finishedAt, "2026-09-22T14:30:00.000Z");
  assert.equal(updated.durationMinutes, 90);
  assert.equal(updated.departureLocation?.latitude, -3.1005);
  assert.equal(updated.description, "Revisão e limpeza dos sistemas finalizada com sucesso.");
  assert.equal(updated.attendants?.length, 1);
  assert.equal(updated.photos?.length, 1);
});

test("finishVisit is idempotent for the same operation", async () => {
  const repository = new InMemoryVisitRepository();
  await repository.save({
    id: "visit-002",
    clientId: "client-001",
    employeeId: "emp-1",
    status: "in_progress",
    arrivedAt: "2026-09-22T13:00:00.000Z",
  });
  const input = {
    visitId: "visit-002",
    clientId: "client-001",
    employeeId: "emp-1",
    operationId: "op-finish-same",
    finishedAt: "2026-09-22T14:00:00.000Z",
  };

  const first = await finishVisit(repository, input);
  const retry = await finishVisit(repository, { ...input, finishedAt: "2026-09-22T15:30:00.000Z" });

  assert.deepEqual(retry, first);
  assert.equal((await repository.findById("visit-002"))?.finishedAt, "2026-09-22T14:00:00.000Z");
});

test("finishVisit refuses a visit that has not started", async () => {
  const repository = new InMemoryVisitRepository();
  await repository.save({ id: "visit-003", clientId: "client-001", employeeId: "emp-1", status: "assigned" });

  await assert.rejects(
    finishVisit(repository, {
      visitId: "visit-003",
      clientId: "client-001",
      employeeId: "emp-1",
      operationId: "op-finish-early",
      finishedAt: "2026-09-22T14:00:00.000Z",
    }),
    /visit not in progress/,
  );
});
