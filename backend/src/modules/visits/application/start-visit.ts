import type { VisitId } from "@qqs/contracts";

import type { Visit } from "../domain/visit.js";

export type StartVisitInput = {
  visitId: VisitId;
  clientId: string;
  employeeId: string;
  arrivedAt: string;
};

export type VisitRepository = {
  findById(id: VisitId): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
};

export async function startVisit(
  repository: VisitRepository,
  input: StartVisitInput,
): Promise<Visit> {
  const existingVisit = await repository.findById(input.visitId);
  if (existingVisit) {
    throw new Error("visit already exists");
  }

  return repository.save({
    id: input.visitId,
    clientId: input.clientId,
    employeeId: input.employeeId,
    status: "in_progress",
    arrivedAt: input.arrivedAt,
  });
}
