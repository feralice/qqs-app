import { test } from "node:test";
import assert from "node:assert/strict";
import type { ClientSummary } from "@qqs/contracts";

import type { User } from "../../../domain/auth/user.js";
import { ClientNotFoundError } from "../../../domain/clients/client.js";
import { EmployeeNotFoundError, VisitNotFoundError } from "../../../domain/visits/visit.js";
import { InMemoryVisitRepository } from "../../../test-support/in-memory-visit-repository.js";
import { createVisit, type CreateVisitDeps } from "./create-visit.js";

const client: ClientSummary = {
  id: "client-1",
  name: "Gases da Amazônia",
  cnpj: "11222333000181",
  address: "Manaus",
  latitude: -3.1,
  longitude: -60.02,
  radiusMeters: 200,
  active: true,
  systems: [],
};

const user = (id: string, active = true): User => ({
  id,
  name: id,
  email: `${id}@qqs.app`,
  passwordHash: "x",
  role: "employee",
  active,
});

function deps(overrides: Partial<CreateVisitDeps> = {}): CreateVisitDeps & { visits: InMemoryVisitRepository } {
  const users = new Map([user("tech-1"), user("tech-2"), user("gone", false)].map((u) => [u.id, u]));
  return {
    visits: new InMemoryVisitRepository(),
    clients: { findById: async (id) => (id === client.id ? client : undefined) },
    users: { findById: async (id) => users.get(id) },
    clock: { now: () => new Date("2026-10-05T13:00:00.000Z") },
    ...overrides,
  } as CreateVisitDeps & { visits: InMemoryVisitRepository };
}

const technician = { sub: "tech-1", role: "employee" as const };
const supervisor = { sub: "boss", role: "supervisor" as const };

test("a technician always schedules the visit for themselves", async () => {
  const { visit, created } = await createVisit(deps(), {
    actor: technician,
    clientId: client.id,
    employeeId: "tech-2",
    scheduledFor: "2026-10-05T12:00:00-04:00",
  }, () => "visit-1");

  assert.equal(created, true);
  assert.equal(visit.employeeId, "tech-1");
  assert.equal(visit.scheduledFor, "2026-10-05T16:00:00.000Z");
  assert.equal(visit.status, "assigned");
});

test("a supervisor assigns the visit to the chosen employee", async () => {
  const { visit } = await createVisit(deps(), { actor: supervisor, clientId: client.id, employeeId: "tech-2" });

  assert.equal(visit.employeeId, "tech-2");
});

test("resending the same id returns the existing visit without creating another", async () => {
  const d = deps();
  const first = await createVisit(d, { actor: technician, id: "offline-1", clientId: client.id });
  const second = await createVisit(d, { actor: technician, id: "offline-1", clientId: client.id });

  assert.equal(second.created, false);
  assert.deepEqual(second.visit, first.visit);
  assert.equal((await d.visits.list()).length, 1);
});

test("resending an id owned by another technician does not reveal it", async () => {
  const d = deps();
  await createVisit(d, { actor: supervisor, id: "v-other", clientId: client.id, employeeId: "tech-2" });

  await assert.rejects(createVisit(d, { actor: technician, id: "v-other", clientId: client.id }), VisitNotFoundError);
});

test("rejects unknown or inactive clients", async () => {
  await assert.rejects(createVisit(deps(), { actor: technician, clientId: "nope" }), ClientNotFoundError);
  await assert.rejects(
    createVisit(deps({ clients: { findById: async () => ({ ...client, active: false }) } }), {
      actor: technician,
      clientId: client.id,
    }),
    ClientNotFoundError,
  );
});

test("rejects inactive or missing employees", async () => {
  await assert.rejects(createVisit(deps(), { actor: supervisor, clientId: client.id, employeeId: "gone" }), EmployeeNotFoundError);
  await assert.rejects(createVisit(deps(), { actor: supervisor, clientId: client.id }), EmployeeNotFoundError);
});

test("without a date the visit is scheduled for now", async () => {
  const { visit } = await createVisit(deps(), { actor: technician, clientId: client.id });

  assert.equal(visit.scheduledFor, "2026-10-05T13:00:00.000Z");
});
