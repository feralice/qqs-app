import type {
  ArrivalLocation,
  ClientId,
  ClientLocation,
  OperationId,
  UserId,
  VisitId,
} from "@qqs/contracts";

import {
  InvalidArrivalDataError,
  JustificationRequiredError,
  VisitAlreadyFinishedError,
  VisitAlreadyStartedError,
  type Visit,
} from "../../../domain/visits/visit.js";
import { evaluateRadius, isValidArrivalData } from "../../../domain/visits/arrival.js";
import type { VisitRepository } from "../ports.js";

export type StartVisitInput = {
  visitId: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  operationId: OperationId;
  arrivedAt: string;
  location?: ArrivalLocation;
  clientLocation: ClientLocation;
  justification?: string;
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
    throw new InvalidArrivalDataError();
  }

  const radius = evaluateRadius(input.clientLocation, input.location);
  const justification = input.justification?.trim() || undefined;
  if (radius.outsideRadius && !justification) {
    throw new JustificationRequiredError();
  }

  const existingVisit = await repository.findById(input.visitId);
  if (existingVisit?.status === "in_progress") {
    throw new VisitAlreadyStartedError();
  }
  if (existingVisit?.status === "completed") {
    throw new VisitAlreadyFinishedError();
  }

  return repository.save({
    ...existingVisit,
    id: input.visitId,
    clientId: input.clientId,
    employeeId: input.employeeId,
    status: "in_progress",
    arrivedAt: input.arrivedAt,
    arrivalLocation: input.location,
    arrivalDistanceMeters: radius.distanceMeters,
    outsideRadius: radius.outsideRadius,
    arrivalJustification: justification,
    lastStartOperationId: input.operationId,
  });
}
