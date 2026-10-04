import { test } from "node:test";
import assert from "node:assert/strict";

import { authedCall, createTestApp, login } from "../../../test-support/http.js";

const newClient = {
  name: "Ambev Manaus",
  cnpj: "00.000.000/0001-91",
  address: "Distrito Industrial II, Manaus",
  latitude: -3.13,
  longitude: -59.95,
  radiusMeters: 300,
  systems: [{ name: "Torre 1", type: "tower" }],
};

async function setup() {
  const app = await createTestApp();
  return { app, admin: await login(app, "supervisor"), technician: await login(app, "employee") };
}

test("technician cannot create a company", async () => {
  const { app, technician } = await setup();
  const response = await authedCall(app, technician, { method: "POST", url: "/clients", body: newClient });
  assert.equal(response.statusCode, 403);
});

test("supervisor creates a company and the technician can find it", async () => {
  const { app, admin, technician } = await setup();
  const created = await authedCall(app, admin, { method: "POST", url: "/clients", body: newClient });
  assert.equal(created.statusCode, 201);
  assert.equal(created._getJSONData().cnpj, "00000000000191");

  const search = await authedCall(app, technician, { method: "GET", url: "/clients?q=ambev" });
  assert.equal(search.statusCode, 200);
  assert.deepEqual(search._getJSONData().items.map((client: { name: string }) => client.name), ["Ambev Manaus"]);
});

test("invalid and duplicated CNPJ are rejected", async () => {
  const { app, admin } = await setup();
  const invalid = await authedCall(app, admin, {
    method: "POST",
    url: "/clients",
    body: { ...newClient, cnpj: "00.000.000/0001-92" },
  });
  assert.equal(invalid.statusCode, 400);

  const duplicated = await authedCall(app, admin, {
    method: "POST",
    url: "/clients",
    body: { ...newClient, cnpj: "11222333000181" },
  });
  assert.equal(duplicated.statusCode, 409);
});

test("only supervisors see inactive companies", async () => {
  const { app, admin, technician } = await setup();
  const patch = await authedCall(app, admin, { method: "PATCH", url: "/clients/client-001", body: { active: false } });
  assert.equal(patch.statusCode, 200);
  assert.equal(patch._getJSONData().active, false);

  const forTechnician = await authedCall(app, technician, { method: "GET", url: "/clients?includeInactive=true" });
  assert.equal(forTechnician._getJSONData().items.length, 0);
  const forAdmin = await authedCall(app, admin, { method: "GET", url: "/clients?includeInactive=true" });
  assert.equal(forAdmin._getJSONData().items.length, 1);
});

test("supervisor adds a system and repeated names conflict", async () => {
  const { app, admin } = await setup();
  const added = await authedCall(app, admin, {
    method: "POST",
    url: "/clients/client-001/systems",
    body: { name: "Torre 3", type: "tower" },
  });
  assert.equal(added.statusCode, 201);
  assert.equal(added._getJSONData().systems.length, 4);

  const repeated = await authedCall(app, admin, {
    method: "POST",
    url: "/clients/client-001/systems",
    body: { name: "Torre 3", type: "tower" },
  });
  assert.equal(repeated.statusCode, 409);
});

test("unknown company returns 404", async () => {
  const { app, technician, admin } = await setup();
  assert.equal((await authedCall(app, technician, { method: "GET", url: "/clients/missing" })).statusCode, 404);
  assert.equal(
    (await authedCall(app, admin, { method: "PATCH", url: "/clients/missing", body: { radiusMeters: 10 } })).statusCode,
    404,
  );
});

test("creating a company with an existing id does not overwrite it", async () => {
  const { app, admin } = await setup();
  const response = await authedCall(app, admin, { method: "POST", url: "/clients", body: { ...newClient, id: "client-001" } });

  assert.equal(response.statusCode, 201);
  assert.notEqual(response._getJSONData().id, "client-001");
  const original = await authedCall(app, admin, { method: "GET", url: "/clients/client-001" });
  assert.equal(original._getJSONData().name, "Gases da Amazônia");
});
