import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../../visits/domain/visit.js";
import { getAdminDashboard } from "./get-admin-dashboard.js";

test("getAdminDashboard counts statuses and marks scheduled visits as overdue", async () => {
  const visits: Visit[] = [
    { id: "v-1", clientId: "c-1", employeeId: "e-1", status: "assigned", scheduledFor: "2026-09-27T08:00:00.000Z" },
    { id: "v-2", clientId: "c-2", employeeId: "e-1", status: "in_progress", scheduledFor: "2026-09-27T09:00:00.000Z" },
    { id: "v-3", clientId: "c-3", employeeId: "e-2", status: "completed", scheduledFor: "2026-09-27T10:00:00.000Z" },
  ];

  const result = await getAdminDashboard(
    {
      list: async () => visits,
      findById: async (id) => visits.find((visit) => visit.id === id),
      findByStartOperationId: async () => undefined,
      save: async (visit) => visit,
    },
    { date: "2026-09-27", now: "2026-09-27T11:00:00.000Z" },
  );

  assert.deepEqual(result.counts, {
    scheduled: 1,
    inProgress: 1,
    completed: 1,
    overdue: 2,
  });
  assert.equal(result.alerts[0]?.visitId, "v-1");
  assert.equal(result.lastUpdatedAt, "2026-09-27T11:00:00.000Z");
});

test("getAdminDashboard returns an empty but loaded summary when there are no visits", async () => {
  const result = await getAdminDashboard(
    {
      list: async () => [],
      findById: async () => undefined,
      findByStartOperationId: async () => undefined,
      save: async (visit) => visit,
    },
    { date: "2026-09-27", now: "2026-09-27T11:00:00.000Z" },
  );

  assert.deepEqual(result.counts, { scheduled: 0, inProgress: 0, completed: 0, overdue: 0 });
  assert.deepEqual(result.alerts, []);
  assert.equal(result.isLoaded, true);
});
