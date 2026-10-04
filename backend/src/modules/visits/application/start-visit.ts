import {
  distanceMeters,
  type ArrivalLocation,
  type ClientId,
  type ClientLocation,
  type OperationId,
  type UserId,
  type VisitId,
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
  clientLocation: ClientLocation;
  justification?: string;
};

export type VisitRepository = {
  findById(id: VisitId): Promise<Visit | undefined>;
  findByStartOperationId(operationId: OperationId): Promise<Visit | undefined>;
  findByFinishOperationId(operationId: OperationId): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
  list(filter?: { employeeId?: UserId }): Promise<Visit[]>;
};

// Sem GPS não há como conferir a distância: conta como fora do raio (RF-016).
export function evaluateRadius(
  client: ClientLocation,
  location?: ArrivalLocation,
): { distanceMeters?: number; outsideRadius: boolean } {
  if (!location) {
    return { distanceMeters: undefined, outsideRadius: true };
  }
  const distance = distanceMeters(client, location);
  return { distanceMeters: distance, outsideRadius: distance > client.radiusMeters };
}

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

  const radius = evaluateRadius(input.clientLocation, input.location);
  const justification = input.justification?.trim() || undefined;
  if (radius.outsideRadius && !justification) {
    throw new Error("justification required");
  }

  const existingVisit = await repository.findById(input.visitId);
  if (existingVisit?.status === "in_progress") {
    throw new Error("visit already exists");
  }
  if (existingVisit?.status === "completed") {
    throw new Error("visit already finished");
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
