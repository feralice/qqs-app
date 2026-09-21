import type {
  ArrivalLocation,
  ClientId,
  OperationId,
  UserId,
  VisitId,
} from "@qqs/contracts";

import type { Visit } from "../domain/visit.js";
import { isValidArrivalData } from "./start-visit.validation.js";

export type StartVisitInput = {
  visitId: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  operationId: OperationId;
  arrivedAt: string;
  location?: ArrivalLocation;
};

export type VisitRepository = {
  findById(id: VisitId): Promise<Visit | undefined>;
  findByStartOperationId(operationId: OperationId): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
};

export async function startVisit(
  repository: VisitRepository,
  input: StartVisitInput,
): Promise<Visit> {
  const appliedOperation = await repository.findByStartOperationId(
    input.operationId,
  );
  if (appliedOperation) {
    return appliedOperation;
  }

  if (!isValidArrivalData(input.arrivedAt, input.location)) {
    throw new Error("invalid arrival data");
  }

  const existingVisit = await repository.findById(input.visitId);
  if (existingVisit?.status === "in_progress") {
    throw new Error("visit already exists");
  }

  return repository.save({
    ...existingVisit,
    id: input.visitId,
    clientId: input.clientId,
    employeeId: input.employeeId,
    status: "in_progress",
    arrivedAt: input.arrivedAt,
    arrivalLocation: input.location,
    lastStartOperationId: input.operationId,
  });
}
