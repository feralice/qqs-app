import type { OperationId, UserId, VisitId } from "@qqs/contracts";

import type { Visit } from "../domain/visits/visit.js";
import type { VisitRepository } from "../application/visits/ports.js";

// Fake para testes de caso de uso; a aplicação usa DrizzleVisitRepository.
export class InMemoryVisitRepository implements VisitRepository {
  private readonly visits = new Map<string, Visit>();

  async findById(id: VisitId): Promise<Visit | undefined> {
    return this.visits.get(id);
  }

  async findByStartOperationId(operationId: OperationId): Promise<Visit | undefined> {
    return [...this.visits.values()].find((visit) => visit.lastStartOperationId === operationId);
  }

  async findByFinishOperationId(operationId: OperationId): Promise<Visit | undefined> {
    return [...this.visits.values()].find((visit) => visit.lastFinishOperationId === operationId);
  }

  async save(visit: Visit): Promise<Visit> {
    this.visits.set(visit.id, visit);
    return visit;
  }

  async list(filter?: { employeeId?: UserId }): Promise<Visit[]> {
    return [...this.visits.values()].filter(
      (visit) => !filter?.employeeId || visit.employeeId === filter.employeeId,
    );
  }
}
