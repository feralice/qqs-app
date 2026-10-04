import { asc, eq, inArray, type SQL } from "drizzle-orm";
import type { OperationId, UserId, VisitId } from "@qqs/contracts";

import type { Database } from "../../../shared/db/database.js";
import { clientSystems, clients, visits } from "../../../shared/db/schema.js";
import type { VisitRepository } from "../application/start-visit.js";
import type { Visit } from "../domain/visit.js";

const toIso = (value: Date | null) => value?.toISOString();
const toDate = (value: string | undefined) => (value ? new Date(value) : null);

export class DrizzleVisitRepository implements VisitRepository {
  constructor(private readonly db: Database) {}

  async findById(id: VisitId): Promise<Visit | undefined> {
    return (await this.select(eq(visits.id, id)))[0];
  }

  async findByStartOperationId(operationId: OperationId): Promise<Visit | undefined> {
    return (await this.select(eq(visits.lastStartOperationId, operationId)))[0];
  }

  async findByFinishOperationId(operationId: OperationId): Promise<Visit | undefined> {
    return (await this.select(eq(visits.lastFinishOperationId, operationId)))[0];
  }

  async list(filter?: { employeeId?: UserId }): Promise<Visit[]> {
    return this.select(filter?.employeeId ? eq(visits.employeeId, filter.employeeId) : undefined);
  }

  // Nome, endereço, coordenadas e sistemas pertencem à empresa; só as colunas da visita são gravadas.
  async save(visit: Visit): Promise<Visit> {
    const row = {
      id: visit.id,
      clientId: visit.clientId,
      employeeId: visit.employeeId,
      status: visit.status,
      scheduledFor: toDate(visit.scheduledFor),
      arrivedAt: toDate(visit.arrivedAt),
      arrivalLocation: visit.arrivalLocation ?? null,
      arrivalDistanceMeters: visit.arrivalDistanceMeters ?? null,
      outsideRadius: visit.outsideRadius ?? false,
      arrivalJustification: visit.arrivalJustification ?? null,
      lastStartOperationId: visit.lastStartOperationId ?? null,
      leftAt: toDate(visit.leftAt),
      departureLocation: visit.departureLocation ?? null,
      durationMinutes: visit.durationMinutes ?? null,
      description: visit.description ?? null,
      attendants: visit.attendants ?? null,
      photos: visit.photos ?? null,
      finishedAt: toDate(visit.finishedAt),
      lastFinishOperationId: visit.lastFinishOperationId ?? null,
    };
    const { id, ...fields } = row;
    await this.db
      .insert(visits)
      .values(row)
      .onConflictDoUpdate({ target: visits.id, set: { ...fields, updatedAt: new Date() } });
    return (await this.findById(visit.id))!;
  }

  private async select(where: SQL | undefined): Promise<Visit[]> {
    const rows = await this.db
      .select({ visit: visits, client: clients })
      .from(visits)
      .innerJoin(clients, eq(visits.clientId, clients.id))
      .where(where)
      .orderBy(asc(visits.scheduledFor));
    if (rows.length === 0) return [];

    const systems = await this.db
      .select()
      .from(clientSystems)
      .where(inArray(clientSystems.clientId, [...new Set(rows.map((row) => row.client.id))]))
      .orderBy(asc(clientSystems.name));

    return rows.map(({ visit, client }) => ({
      id: visit.id,
      clientId: visit.clientId,
      employeeId: visit.employeeId,
      status: visit.status,
      clientName: client.name,
      clientAddress: client.address,
      clientLocation: { latitude: client.latitude, longitude: client.longitude, radiusMeters: client.radiusMeters },
      systems: systems
        .filter((system) => system.clientId === client.id)
        .map(({ id, name, type }) => ({ id, name, type })),
      scheduledFor: toIso(visit.scheduledFor),
      arrivedAt: toIso(visit.arrivedAt),
      arrivalLocation: visit.arrivalLocation ?? undefined,
      arrivalDistanceMeters: visit.arrivalDistanceMeters ?? undefined,
      outsideRadius: visit.outsideRadius,
      arrivalJustification: visit.arrivalJustification ?? undefined,
      lastStartOperationId: visit.lastStartOperationId ?? undefined,
      leftAt: toIso(visit.leftAt),
      departureLocation: visit.departureLocation ?? undefined,
      durationMinutes: visit.durationMinutes ?? undefined,
      description: visit.description ?? undefined,
      attendants: visit.attendants ?? undefined,
      photos: visit.photos ?? undefined,
      finishedAt: toIso(visit.finishedAt),
      lastFinishOperationId: visit.lastFinishOperationId ?? undefined,
    }));
  }
}
