import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../domain/visit.js";
import { startVisit } from "./start-visit.js";
import type { VisitRepository } from "./start-visit.js";

function repositoryWith(visit?: Visit): VisitRepository {
  let saved = visit;
  return {
    findById: async () => saved,
    findByStartOperationId: async (operationId) =>
      saved?.lastStartOperationId === operationId ? saved : undefined,
    save: async (nextVisit) => {
      saved = nextVisit;
      return nextVisit;
    },
  };
}

test("startVisit records arrival with location", async () => {
  const visit = await startVisit(repositoryWith(), {
    visitId: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    operationId: "operation-1",
    arrivedAt: "2026-09-20T12:00:00.000Z",
    location: { latitude: -3.119, longitude: -60.021, accuracy: 12.5 },
  });

  assert.deepEqual(visit, {
    id: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    status: "in_progress",
    arrivedAt: "2026-09-20T12:00:00.000Z",
    arrivalLocation: { latitude: -3.119, longitude: -60.021, accuracy: 12.5 },
    lastStartOperationId: "operation-1",
  });
});

test("startVisit is idempotent for the same operation", async () => {
  const repository = repositoryWith();
  const input = {
    visitId: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    operationId: "operation-1",
    arrivedAt: "2026-09-20T12:00:00.000Z",
  };

  const first = await startVisit(repository, input);
  const second = await startVisit(repository, input);

  assert.deepEqual(second, first);
});

test("startVisit accepts arrival without location", async () => {
  const visit = await startVisit(repositoryWith(), {
    visitId: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    operationId: "operation-1",
    arrivedAt: "2026-09-20T12:00:00.000Z",
  });

  assert.equal(visit.arrivalLocation, undefined);
});

test("startVisit rejects invalid arrival data", async () => {
  await assert.rejects(
    () =>
      startVisit(repositoryWith(), {
        visitId: "visit-1",
        clientId: "client-1",
        employeeId: "employee-1",
        operationId: "operation-1",
        arrivedAt: "not-a-date",
        location: { latitude: 91, longitude: -60.021, accuracy: -1 },
      }),
    /invalid arrival data/,
  );
});
