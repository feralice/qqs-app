import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequest, createResponse } from "node-mocks-http";
import type { Express } from "express";

import { createApp } from "../../../app.js";

// bcrypt (usado no login de apoio) roda em várias etapas assíncronas; espera
// response._isEndCalled() em vez de um único tick.
async function call(app: Express, options: Parameters<typeof createRequest>[0]) {
  const response = createResponse();
  app(createRequest(options), response);
  for (let tick = 0; tick < 100 && !response._isEndCalled(); tick++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  return response;
}

async function login(app: Express, role: "employee" | "supervisor" = "employee") {
  const credentials = role === "supervisor"
    ? { email: "admin1@qqs.app", password: "Admin123!" }
    : { email: "tecnico@qqs.app", password: "Tecnico123!" };

  const loginResponse = await call(app, {
    method: "POST",
    url: "/auth/login",
    body: credentials,
  });
  return loginResponse._getJSONData().accessToken as string;
}

// Cada teste ganha seu próprio app + login, pra não depender de estado de outro teste.
async function request(options: NonNullable<Parameters<typeof createRequest>[0]>, role: "employee" | "supervisor" = "employee") {
  const app = createApp();
  const token = await login(app, role);

  return call(app, {
    ...options,
    headers: { authorization: `Bearer ${token}`, ...options.headers },
  });
}

test("GET /visits returns the development visit", async () => {
  const response = await request({ method: "GET", url: "/visits" });

  assert.equal(response.statusCode, 200);
  assert.equal(response._getJSONData().items[0].id, "visit-001");
});

test("GET /visits/:id returns visit details", async () => {
  const response = await request({ method: "GET", url: "/visits/visit-001" });

  assert.equal(response.statusCode, 200);
  assert.equal(response._getJSONData().clientName, "Gases da Amazônia");
});

test("POST /visits/:id/start records an idempotent arrival", async () => {
  const app = createApp();
  const token = await login(app, "employee");
  const body = {
    operationId: "operation-route-001",
    arrivedAt: "2026-09-20T12:00:00.000Z",
    location: { latitude: -3.119, longitude: -60.021, accuracy: 12.5 },
  };
  const first = await call(app, {
    method: "POST",
    url: "/visits/visit-001/start",
    headers: { authorization: `Bearer ${token}` },
    body,
  });
  const second = await call(app, {
    method: "POST",
    url: "/visits/visit-001/start",
    headers: { authorization: `Bearer ${token}` },
    body,
  });

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second._getJSONData(), first._getJSONData());
});

test("POST /visits/:id/start rejects invalid coordinates", async () => {
  const response = await request({
    method: "POST",
    url: "/visits/visit-001/start",
    body: {
      operationId: "operation-route-invalid",
      arrivedAt: "2026-09-20T12:00:00.000Z",
      location: { latitude: 91, longitude: -60.021 },
    },
  });

  assert.equal(response.statusCode, 400);
});

test("POST /visits/:id/finish records departure, duration, description, attendants and photos", async () => {
  const app = createApp();
  const token = await login(app, "employee");

  await call(app, {
    method: "POST",
    url: "/visits/visit-001/start",
    headers: { authorization: `Bearer ${token}` },
    body: {
      operationId: "op-start-finish-test",
      arrivedAt: "2026-09-22T13:00:00.000Z",
      location: { latitude: -3.1, longitude: -60.0 },
    },
  });

  const finishResponse = await call(app, {
    method: "POST",
    url: "/visits/visit-001/finish",
    headers: { authorization: `Bearer ${token}` },
    body: {
      operationId: "op-finish-route-test",
      finishedAt: "2026-09-22T14:45:00.000Z",
      location: { latitude: -3.1002, longitude: -60.0002 },
      description: "Serviço de manutenção preventiva realizado com sucesso.",
      attendants: [{ id: "emp-2", name: "Carlos Silva", email: "carlos@qqs.com", role: "employee" }],
      photos: [{ id: "p-1", uri: "data:image/jpeg;base64,...", caption: "Torre 1 pronta", takenAt: "2026-09-22T14:00:00.000Z" }],
    },
  });

  assert.equal(finishResponse.statusCode, 200);
  const data = finishResponse._getJSONData();
  assert.equal(data.status, "completed");
  assert.equal(data.durationMinutes, 105);
  assert.equal(data.description, "Serviço de manutenção preventiva realizado com sucesso.");
  assert.equal(data.departure?.location?.latitude, -3.1002);
  assert.equal(data.attendants?.length, 1);
  assert.equal(data.photos?.length, 1);
});

test("GET /employees returns list of available technicians", async () => {
  const response = await request({ method: "GET", url: "/employees" });

  assert.equal(response.statusCode, 200);
  const data = response._getJSONData();
  assert.ok(Array.isArray(data.items));
  assert.ok(data.items.length >= 1);
  assert.ok(data.items.some((emp: { email: string }) => emp.email === "tecnico@qqs.app"));
});

test("POST /visits allows supervisor to schedule a new visit", async () => {
  const response = await request({
    method: "POST",
    url: "/visits",
    body: {
      clientId: "client-002",
      clientName: "Petrobras Distribuidora",
      clientAddress: "Distrito Industrial, Manaus",
      employeeId: "employee-001",
      scheduledFor: "2026-09-23T10:00:00.000Z",
      systems: [
        { id: "sys-01", name: "Chiller 1", type: "chiller" },
        { id: "sys-02", name: "Caldeira Central", type: "boiler" },
      ],
    },
  }, "supervisor");

  assert.equal(response.statusCode, 201);
  const data = response._getJSONData();
  assert.ok(data.id);
  assert.equal(data.clientName, "Petrobras Distribuidora");
  assert.equal(data.status, "assigned");
  assert.equal(data.systemsCount, 2);
});
