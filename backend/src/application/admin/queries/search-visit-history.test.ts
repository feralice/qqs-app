import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../../../domain/visits/visit.js";
import { searchVisitHistory } from "./search-visit-history.js";

test("searchVisitHistory filters by date, employee and status", async () => {
  const visits: Visit[] = [
    { id: "v-1", clientId: "c-1", employeeId: "e-1", clientName: "Cliente A", status: "completed", scheduledFor: "2026-09-27T09:00:00.000Z" },
    { id: "v-2", clientId: "c-2", employeeId: "e-2", clientName: "Cliente B", status: "assigned", scheduledFor: "2026-09-27T10:00:00.000Z" },
  ];
  const result = await searchVisitHistory({ list: async () => visits }, { from: "2026-09-27", to: "2026-09-27", employeeId: "e-1", status: "completed" });

  assert.deepEqual(result.items.map((item) => item.id), ["v-1"]);
  assert.equal(result.total, 1);
});

test("searchVisitHistory returns an empty page for no matches", async () => {
  const result = await searchVisitHistory({ list: async () => [] }, { from: "2026-09-27", to: "2026-09-27" });
  assert.deepEqual(result, { items: [], total: 0 });
});
