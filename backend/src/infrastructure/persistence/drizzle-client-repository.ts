import { and, asc, eq, ilike, inArray, like, or, type SQL } from "drizzle-orm";
import type { ClientSummary, ClientSystem } from "@qqs/contracts";

import type { Database } from "../db/database.js";
import { clientSystems, clients } from "../db/schema.js";
import type { ClientListFilter, ClientRecord, ClientRepository } from "../../application/clients/ports.js";

export class DrizzleClientRepository implements ClientRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<ClientSummary | undefined> {
    return (await this.select(eq(clients.id, id)))[0];
  }

  async findByCnpj(cnpj: string): Promise<ClientSummary | undefined> {
    return (await this.select(eq(clients.cnpj, cnpj)))[0];
  }

  async list(filter: ClientListFilter): Promise<ClientSummary[]> {
    const conditions: SQL[] = [];
    if (!filter.includeInactive) conditions.push(eq(clients.active, true));
    const q = filter.q?.trim();
    if (q) {
      const digits = q.replace(/\D/g, "");
      const byName = ilike(clients.name, `%${q}%`);
      conditions.push(digits ? or(byName, like(clients.cnpj, `%${digits}%`))! : byName);
    }
    return this.select(conditions.length ? and(...conditions) : undefined);
  }

  async save(client: ClientRecord): Promise<void> {
    const { id, ...fields } = client;
    await this.db
      .insert(clients)
      .values(client)
      .onConflictDoUpdate({ target: clients.id, set: { ...fields, updatedAt: new Date() } });
  }

  async addSystem(system: ClientSystem): Promise<void> {
    await this.db.insert(clientSystems).values(system);
  }

  private async select(where: SQL | undefined): Promise<ClientSummary[]> {
    const rows = await this.db.select().from(clients).where(where).orderBy(asc(clients.name));
    if (rows.length === 0) return [];

    const systems = await this.db
      .select()
      .from(clientSystems)
      .where(inArray(clientSystems.clientId, rows.map((row) => row.id)))
      .orderBy(asc(clientSystems.name));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      cnpj: row.cnpj,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      radiusMeters: row.radiusMeters,
      active: row.active,
      systems: systems
        .filter((system) => system.clientId === row.id)
        .map(({ id, clientId, name, type }) => ({ id, clientId, name, type })),
    }));
  }
}
