import type {
  ArrivalLocation,
  ClientId,
  EmployeeSummary,
  OperationId,
  UserId,
  VisitId,
  VisitPhoto,
} from "@qqs/contracts";

import type { Visit } from "../domain/visit.js";

export type FinishVisitInput = {
  visitId: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  operationId: OperationId;
  finishedAt: string;
  location?: ArrivalLocation;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
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

  const arrivedTime = existingVisit?.arrivedAt
    ? new Date(existingVisit.arrivedAt).getTime()
    : new Date(input.finishedAt).getTime();
  const finishedTime = new Date(input.finishedAt).getTime();
  const durationMinutes = Math.max(
    0,
    Math.round((finishedTime - arrivedTime) / (1000 * 60)),
  );

  return repository.save({
    ...existingVisit,
    id: input.visitId,
    clientId: input.clientId,
    employeeId: input.employeeId,
    status: "completed",
    arrivedAt: existingVisit?.arrivedAt ?? input.finishedAt,
    finishedAt: input.finishedAt,
    leftAt: input.finishedAt,
    departureLocation: input.location,
    durationMinutes,
    description: input.description ?? existingVisit?.description,
    attendants: input.attendants ?? existingVisit?.attendants,
    photos: input.photos ?? existingVisit?.photos,
    lastFinishOperationId: input.operationId,
  });
}
