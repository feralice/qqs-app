import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../../../domain/visits/visit.js";
import { startVisit, type StartVisitInput } from "./start-visit.js";
import type { VisitRepository } from "../ports.js";

function repositoryWith(visit?: Visit): VisitRepository {
  let saved = visit;
  return {
    findById: async () => saved,
    findByStartOperationId: async (operationId) =>
      saved?.lastStartOperationId === operationId ? saved : undefined,
    findByFinishOperationId: async () => undefined,
    save: async (nextVisit) => {
      saved = nextVisit;
      return nextVisit;
    },
    list: async () => (saved ? [saved] : []),
  };
}

const clientLocation = { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 };
const insideRadius = { latitude: -3.102, longitude: -60.0251, accuracy: 8 };
const outsideRadius = { latitude: -3.119, longitude: -60.021, accuracy: 12.5 };

const base: StartVisitInput = {
  visitId: "visit-1",
  clientId: "client-1",
  employeeId: "employee-1",
  operationId: "operation-1",
  arrivedAt: "2026-09-20T12:00:00.000Z",
  clientLocation,
};

test("startVisit inside the radius records arrival, distance and no flag", async () => {
  const visit = await startVisit(repositoryWith(), { ...base, location: insideRadius });

  assert.deepEqual(visit, {
    id: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    status: "in_progress",
    arrivedAt: "2026-09-20T12:00:00.000Z",
    arrivalLocation: insideRadius,
    arrivalDistanceMeters: 16,
    outsideRadius: false,
    arrivalJustification: undefined,
    lastStartOperationId: "operation-1",
  });
});

test("startVisit is idempotent for the same operation", async () => {
  const repository = repositoryWith();
  const input = { ...base, location: insideRadius };

  const first = await startVisit(repository, input);
  const second = await startVisit(repository, input);

  assert.deepEqual(second, first);
});

test("startVisit outside the radius without justification is rejected", async () => {
  await assert.rejects(startVisit(repositoryWith(), { ...base, location: outsideRadius }), /justification required/);
});

test("startVisit outside the radius with justification is flagged", async () => {
  const visit = await startVisit(repositoryWith(), {
    ...base,
    location: outsideRadius,
    justification: "  Portaria fica a 2 km da planta  ",
  });

  assert.equal(visit.outsideRadius, true);
  assert.equal(visit.arrivalDistanceMeters, 1953);
  assert.equal(visit.arrivalJustification, "Portaria fica a 2 km da planta");
});

test("startVisit without GPS requires justification and is flagged without distance", async () => {
  await assert.rejects(startVisit(repositoryWith(), base), /justification required/);

  const visit = await startVisit(repositoryWith(), { ...base, justification: "GPS sem sinal" });
  assert.equal(visit.outsideRadius, true);
  assert.equal(visit.arrivalDistanceMeters, undefined);
  assert.equal(visit.arrivalLocation, undefined);
});

test("startVisit treats a whitespace-only justification as missing", async () => {
  await assert.rejects(
    startVisit(repositoryWith(), { ...base, location: outsideRadius, justification: "   " }),
    /justification required/,
  );
});

test("startVisit at exactly the radius counts as inside", async () => {
  const visit = await startVisit(repositoryWith(), {
    ...base,
    clientLocation: { ...clientLocation, radiusMeters: 16 },
    location: insideRadius,
  });
  assert.equal(visit.outsideRadius, false);
});

test("startVisit rejects invalid arrival data", async () => {
  await assert.rejects(
    () =>
      startVisit(repositoryWith(), {
        ...base,
        arrivedAt: "not-a-date",
        location: { latitude: 91, longitude: -60.021, accuracy: -1 },
      }),
    /invalid arrival data/,
  );
});

test("startVisit refuses to reopen a completed visit", async () => {
  const completed: Visit = { id: "visit-1", clientId: "client-1", employeeId: "employee-1", status: "completed" };
  await assert.rejects(
    startVisit(repositoryWith(completed), { ...base, operationId: "late-replay", location: insideRadius }),
    /visit already finished/,
  );
});
