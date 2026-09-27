import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../../visits/domain/visit.js";
import { createAdminActions } from "./admin-actions.js";

function repository(initial: Visit): { findById: (id: string) => Promise<Visit | undefined>; save: (visit: Visit) => Promise<Visit> } {
  let current = initial;
  return {
    findById: async () => current,
    save: async (visit) => {
      current = visit;
      return visit;
    },
  };
}

test("rescheduleVisit applies once for a repeated operation id", async () => {
  const actions = createAdminActions(
    repository({ id: "v-1", clientId: "c-1", employeeId: "e-1", status: "assigned", scheduledFor: "2026-09-27T09:00:00.000Z" }),
  );

  const input = { visitId: "v-1", scheduledFor: "2026-09-28T10:00:00.000Z", operationId: "op-1" };
  const first = await actions.rescheduleVisit(input);
  const second = await actions.rescheduleVisit(input);

  assert.equal(first.scheduledFor, "2026-09-28T10:00:00.000Z");
  assert.deepEqual(second, first);
});

test("reassignVisit changes the responsible employee", async () => {
  const actions = createAdminActions(
    repository({ id: "v-1", clientId: "c-1", employeeId: "e-1", status: "assigned" }),
  );

  const result = await actions.reassignVisit({ visitId: "v-1", employeeId: "e-2", operationId: "op-2" });

  assert.equal(result.employeeId, "e-2");
});

test("resolveAlert is idempotent", async () => {
  const actions = createAdminActions(repository({ id: "v-1", clientId: "c-1", employeeId: "e-1", status: "assigned" }));

  assert.deepEqual(await actions.resolveAlert({ alertId: "a-1", operationId: "op-3" }), { alertId: "a-1", resolved: true });
  assert.deepEqual(await actions.resolveAlert({ alertId: "a-1", operationId: "op-3" }), { alertId: "a-1", resolved: true });
});
