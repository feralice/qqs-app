import { randomUUID } from "node:crypto";
import type { ClientSummary } from "@qqs/contracts";

import type { Clock } from "../../common/clock.js";
import type { Actor } from "../../../domain/common/actor.js";
import type { User } from "../../../domain/auth/user.js";
import { ClientNotFoundError } from "../../../domain/clients/client.js";
import { EmployeeNotFoundError, type Visit } from "../../../domain/visits/visit.js";
import type { VisitRepository } from "../ports.js";
import { getVisibleVisit } from "../queries/visit-queries.js";

export type CreateVisitDeps = {
  visits: Pick<VisitRepository, "findById" | "save">;
  clients: { findById(id: string): Promise<ClientSummary | undefined> };
  users: { findById(id: string): Promise<User | undefined> };
  clock: Clock;
};

export type CreateVisitInput = {
  actor: Actor;
  id?: string;
  clientId: string;
  employeeId?: string;
  scheduledFor?: string;
};

export type CreateVisitResult = { visit: Visit; created: boolean };

// O id pode vir do aparelho (criação offline): reenviar o mesmo id devolve a
// visita já criada em vez de duplicar (RF-042).
export async function createVisit(
  deps: CreateVisitDeps,
  input: CreateVisitInput,
  newId: () => string = randomUUID,
): Promise<CreateVisitResult> {
  const id = input.id || newId();
  if (await deps.visits.findById(id)) {
    return { visit: await getVisibleVisit(deps.visits, id, input.actor), created: false };
  }

  const client = await deps.clients.findById(input.clientId);
  if (!client?.active) throw new ClientNotFoundError();

  // Técnico só agenda para si; supervisor escolhe o responsável.
  const employeeId = input.actor.role === "supervisor" ? input.employeeId : input.actor.sub;
  const employee = employeeId ? await deps.users.findById(employeeId) : undefined;
  if (!employee?.active) throw new EmployeeNotFoundError();

  const scheduledFor = (input.scheduledFor ? new Date(input.scheduledFor) : deps.clock.now()).toISOString();
  const visit = await deps.visits.save({ id, clientId: client.id, employeeId: employee.id, scheduledFor, status: "assigned" });
  return { visit, created: true };
}
