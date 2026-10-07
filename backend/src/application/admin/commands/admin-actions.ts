import type { OperationId } from "@qqs/contracts";

import { runOnce, type IdempotencyStore } from "../../common/idempotency.js";
import { VisitNotFoundError, type Visit } from "../../../domain/visits/visit.js";

export type AdminVisitRepository = {
  findById(id: string): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
};

export type AdminActions = ReturnType<typeof createAdminActions>;

export function createAdminActions(repository: AdminVisitRepository, idempotency: IdempotencyStore) {
  async function updateVisit(visitId: string, change: Partial<Visit>): Promise<Visit> {
    const visit = await repository.findById(visitId);
    if (!visit) throw new VisitNotFoundError();
    return repository.save({ ...visit, ...change });
  }

  function rescheduleVisit(input: { visitId: string; scheduledFor: string; operationId: OperationId }): Promise<Visit> {
    return runOnce(idempotency, input.operationId, "visit.reschedule", () =>
      updateVisit(input.visitId, { scheduledFor: input.scheduledFor }),
    );
  }

  function reassignVisit(input: { visitId: string; employeeId: string; operationId: OperationId }): Promise<Visit> {
    return runOnce(idempotency, input.operationId, "visit.reassign", () =>
      updateVisit(input.visitId, { employeeId: input.employeeId }),
    );
  }

  function resolveAlert(input: { alertId: string; operationId: OperationId }): Promise<{ alertId: string; resolved: true }> {
    return runOnce(idempotency, input.operationId, "alert.resolve", async () => ({
      alertId: input.alertId,
      resolved: true as const,
    }));
  }

  return { rescheduleVisit, reassignVisit, resolveAlert };
}
