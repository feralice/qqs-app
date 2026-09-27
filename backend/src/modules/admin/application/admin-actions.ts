import type { OperationId } from "@qqs/contracts";

import type { Visit } from "../../visits/domain/visit.js";

export type AdminVisitRepository = {
  findById(id: string): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
};

export type AdminActions = ReturnType<typeof createAdminActions>;

export function createAdminActions(repository: AdminVisitRepository) {
  const appliedOperations = new Map<OperationId, unknown>();

  async function rescheduleVisit(input: {
    visitId: string;
    scheduledFor: string;
    operationId: OperationId;
  }): Promise<Visit> {
    const existing = appliedOperations.get(input.operationId);
    if (existing) return existing as Visit;
    const visit = await repository.findById(input.visitId);
    if (!visit) throw new Error("visit not found");
    const updated = await repository.save({ ...visit, scheduledFor: input.scheduledFor });
    appliedOperations.set(input.operationId, updated);
    return updated;
  }

  async function reassignVisit(input: {
    visitId: string;
    employeeId: string;
    operationId: OperationId;
  }): Promise<Visit> {
    const existing = appliedOperations.get(input.operationId);
    if (existing) return existing as Visit;
    const visit = await repository.findById(input.visitId);
    if (!visit) throw new Error("visit not found");
    const updated = await repository.save({ ...visit, employeeId: input.employeeId });
    appliedOperations.set(input.operationId, updated);
    return updated;
  }

  async function resolveAlert(input: {
    alertId: string;
    operationId: OperationId;
  }): Promise<{ alertId: string; resolved: true }> {
    const existing = appliedOperations.get(input.operationId);
    if (existing) return existing as { alertId: string; resolved: true };
    const result = { alertId: input.alertId, resolved: true as const };
    appliedOperations.set(input.operationId, result);
    return result;
  }

  return { rescheduleVisit, reassignVisit, resolveAlert };
}
