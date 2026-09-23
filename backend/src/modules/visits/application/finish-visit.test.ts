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
