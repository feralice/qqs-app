import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../domain/visit.js";
import { startVisit } from "./start-visit.js";
import type { VisitRepository } from "./start-visit.js";

test("startVisit creates an in-progress visit with the arrival time", async () => {
  const repository: VisitRepository = {
    findById: async () => undefined,
    save: async (visit: Visit) => visit,
  };

  const visit = await startVisit(repository, {
    visitId: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    arrivedAt: "2026-09-20T12:00:00.000Z",
  });

  assert.deepEqual(visit, {
    id: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    status: "in_progress",
    arrivedAt: "2026-09-20T12:00:00.000Z",
  });
});

test("startVisit rejects an existing visit identifier", async () => {
  const existingVisit: Visit = {
    id: "visit-1",
    clientId: "client-1",
    employeeId: "employee-1",
    status: "in_progress",
    arrivedAt: "2026-09-20T12:00:00.000Z",
  };
  const repository: VisitRepository = {
    findById: async () => existingVisit,
    save: async (visit: Visit) => visit,
  };

  await assert.rejects(
    () =>
      startVisit(repository, {
        visitId: "visit-1",
        clientId: "client-1",
        employeeId: "employee-1",
        arrivedAt: "2026-09-20T12:00:00.000Z",
      }),
    /visit already exists/,
  );
});
