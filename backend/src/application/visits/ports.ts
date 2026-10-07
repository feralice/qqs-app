import type { OperationId, UserId, VisitId } from "@qqs/contracts";

import type { Visit } from "../../domain/visits/visit.js";

export type VisitRepository = {
  findById(id: VisitId): Promise<Visit | undefined>;
  findByStartOperationId(operationId: OperationId): Promise<Visit | undefined>;
  findByFinishOperationId(operationId: OperationId): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
  list(filter?: { employeeId?: UserId }): Promise<Visit[]>;
};
