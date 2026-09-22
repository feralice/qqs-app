import type { ClientId, OperationId, UserId, VisitId } from "@qqs/contracts";

import type { Visit } from "../domain/visit.js";

export type FinishVisitInput = {
  visitId: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  operationId: OperationId;
  finishedAt: string;
};

export type FinishVisitRepository = {
  findById(id: VisitId): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
};

export async function finishVisit(
  repository: FinishVisitRepository,
  input: FinishVisitInput,
): Promise<Visit> {
  const existingVisit = await repository.findById(input.visitId);

  return repository.save({
    ...existingVisit,
    id: input.visitId,
    clientId: input.clientId,
    employeeId: input.employeeId,
    status: "completed",
    arrivedAt: existingVisit?.arrivedAt ?? input.finishedAt,
    finishedAt: input.finishedAt,
    lastFinishOperationId: input.operationId,
  });
}
