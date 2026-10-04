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
    { list: async () => visits },
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
    { list: async () => [] },
    { date: "2026-09-27", now: "2026-09-27T11:00:00.000Z" },
  );

  assert.deepEqual(result.counts, { scheduled: 0, inProgress: 0, completed: 0, overdue: 0 });
  assert.deepEqual(result.alerts, []);
  assert.equal(result.isLoaded, true);
});

test("getAdminDashboard raises an alert for out-of-radius check-ins of the day", async () => {
  const visits: Visit[] = [
    {
      id: "v-far",
      clientId: "c-1",
      clientName: "Gases da Amazônia",
      employeeId: "e-1",
      status: "in_progress",
      scheduledFor: "2026-09-27T08:00:00.000Z",
      arrivedAt: "2026-09-27T08:05:00.000Z",
      outsideRadius: true,
      arrivalDistanceMeters: 1953,
    },
    {
      id: "v-nogps",
      clientId: "c-2",
      clientName: "Ambev Manaus",
      employeeId: "e-2",
      status: "completed",
      scheduledFor: "2026-09-27T09:00:00.000Z",
      arrivedAt: "2026-09-27T09:05:00.000Z",
      outsideRadius: true,
    },
    { id: "v-ok", clientId: "c-3", employeeId: "e-3", status: "in_progress", scheduledFor: "2026-09-27T10:00:00.000Z", outsideRadius: false },
  ];

  const result = await getAdminDashboard({ list: async () => visits }, { date: "2026-09-27", now: "2026-09-27T08:30:00.000Z" });

  const radiusAlerts = result.alerts.filter((alert) => alert.type === "outside_radius");
  assert.deepEqual(
    radiusAlerts.map((alert) => [alert.visitId, alert.message]),
    [
      ["v-far", "Check-in fora do raio: Gases da Amazônia (1953 m)"],
      ["v-nogps", "Check-in fora do raio: Ambev Manaus (sem GPS)"],
    ],
  );
  assert.equal(radiusAlerts[0].createdAt, "2026-09-27T08:05:00.000Z");
});
