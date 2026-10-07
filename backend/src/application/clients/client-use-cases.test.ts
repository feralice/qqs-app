import { test } from "node:test";
import assert from "node:assert/strict";
import type { CreateClientRequest } from "@qqs/contracts";

import { createTestDatabase } from "../../infrastructure/db/test-database.js";
import { DrizzleClientRepository } from "../../infrastructure/persistence/drizzle-client-repository.js";
import {
  ClientNotFoundError,
  CnpjAlreadyRegisteredError,
  DuplicateSystemError,
  InvalidClientError,
} from "../../domain/clients/client.js";
import { addClientSystem } from "./commands/add-client-system.js";
import { createClient } from "./commands/create-client.js";
import { updateClient } from "./commands/update-client.js";

const valid: CreateClientRequest = {
  name: "Gases da Amazônia",
  cnpj: "11.222.333/0001-81",
  address: "Distrito Industrial, Manaus",
  latitude: -3.1019,
  longitude: -60.025,
  radiusMeters: 200,
  systems: [
    { name: "Torre 1", type: "tower" },
    { name: "Torre 2", type: "tower" },
    { name: "Caldeira 1", type: "boiler" },
  ],
};

async function repository() {
  return new DrizzleClientRepository(await createTestDatabase());
}

test("createClient stores a company with two towers and a boiler", async () => {
  const repo = await repository();
  const created = await createClient(repo, valid);

  const stored = await repo.findById(created.id);
  assert.equal(stored?.cnpj, "11222333000181");
  assert.equal(stored?.radiusMeters, 200);
  assert.equal(stored?.active, true);
  assert.deepEqual(stored?.systems.map((system) => system.name).sort(), ["Caldeira 1", "Torre 1", "Torre 2"]);
});

test("createClient rejects invalid fields", async () => {
  const repo = await repository();
  const invalid: Array<Partial<CreateClientRequest>> = [
    { name: "  " },
    { address: "" },
    { cnpj: "11.222.333/0001-82" },
    { latitude: 91 },
    { longitude: -181 },
    { radiusMeters: 0 },
    { radiusMeters: 12.5 },
    { latitude: Number.NaN },
  ];
  for (const override of invalid) {
    await assert.rejects(createClient(repo, { ...valid, ...override }), InvalidClientError, JSON.stringify(override));
  }
});

test("createClient rejects a CNPJ already registered in another format", async () => {
  const repo = await repository();
  await createClient(repo, { ...valid, cnpj: "11222333000181" });
  await assert.rejects(createClient(repo, valid), CnpjAlreadyRegisteredError);
});

test("createClient rejects two systems with the same name", async () => {
  const repo = await repository();
  await assert.rejects(
    createClient(repo, { ...valid, systems: [{ name: "Torre 1", type: "tower" }, { name: "Torre 1", type: "tower" }] }),
    DuplicateSystemError,
  );
});

test("inactive companies are hidden unless includeInactive is set", async () => {
  const repo = await repository();
  const created = await createClient(repo, valid);
  await updateClient(repo, created.id, { active: false });

  assert.equal((await repo.list({})).length, 0);
  assert.equal((await repo.list({ includeInactive: true }))[0].active, false);
});

test("updateClient validates changed fields and keeps the rest", async () => {
  const repo = await repository();
  const created = await createClient(repo, valid);

  const updated = await updateClient(repo, created.id, { radiusMeters: 350 });
  assert.equal(updated.radiusMeters, 350);
  assert.equal(updated.name, valid.name);
  await assert.rejects(updateClient(repo, created.id, { latitude: 100 }), InvalidClientError);
  await assert.rejects(updateClient(repo, "missing", { radiusMeters: 10 }), ClientNotFoundError);
});

test("list searches by name ignoring case and by CNPJ digits", async () => {
  const repo = await repository();
  await createClient(repo, valid);
  await createClient(repo, { ...valid, name: "Ambev Manaus", cnpj: "00.000.000/0001-91", systems: [] });

  assert.deepEqual((await repo.list({ q: "GASES" })).map((client) => client.name), ["Gases da Amazônia"]);
  assert.deepEqual((await repo.list({ q: "00000000" })).map((client) => client.name), ["Ambev Manaus"]);
  assert.equal((await repo.list({})).length, 2);
});

test("addClientSystem appends a unit and rejects a repeated name", async () => {
  const repo = await repository();
  const created = await createClient(repo, { ...valid, systems: [] });

  const updated = await addClientSystem(repo, created.id, { name: "Torre 3", type: "tower" });
  assert.equal(updated.systems.length, 1);
  await assert.rejects(addClientSystem(repo, created.id, { name: "Torre 3", type: "tower" }), DuplicateSystemError);
  await assert.rejects(addClientSystem(repo, created.id, { name: " ", type: "tower" }), InvalidClientError);
  await assert.rejects(addClientSystem(repo, "missing", { name: "X", type: "tower" }), ClientNotFoundError);
});
