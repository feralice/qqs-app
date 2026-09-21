import type { VisitId } from "@qqs/contracts";

import type { Visit } from "../domain/visit.js";
import type { VisitRepository } from "../application/start-visit.js";

export class InMemoryVisitRepository implements VisitRepository {
  private readonly visits = new Map<string, Visit>([
    [
      "visit-001",
      {
        id: "visit-001",
        clientId: "client-001",
        employeeId: "employee-001",
        clientName: "Gases da Amazônia",
        clientAddress: "Manaus, AM",
        scheduledFor: "2026-09-21T13:00:00.000Z",
        systems: [
          { id: "system-001", name: "Torre 1", type: "tower" },
          { id: "system-002", name: "Torre 2", type: "tower" },
          { id: "system-003", name: "Caldeira 1", type: "boiler" },
        ],
        status: "assigned",
      },
    ],
  ]);

  async findById(id: VisitId): Promise<Visit | undefined> {
    return this.visits.get(id);
  }

  async findByStartOperationId(operationId: string): Promise<Visit | undefined> {
    return [...this.visits.values()].find(
      (visit) => visit.lastStartOperationId === operationId,
    );
  }

  async save(visit: Visit): Promise<Visit> {
    this.visits.set(visit.id, visit);
    return visit;
  }

  async list(): Promise<Visit[]> {
    return [...this.visits.values()];
  }
}
