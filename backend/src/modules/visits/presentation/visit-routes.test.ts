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

// Cada teste ganha seu próprio app + login, pra não depender de estado de outro teste.
async function request(options: NonNullable<Parameters<typeof createRequest>[0]>) {
  const app = createApp();
  const loginResponse = await call(app, {
    method: "POST",
    url: "/auth/login",
    body: { email: "tecnico@qqs.app", password: "Tecnico123!" },
  });
  const { accessToken } = loginResponse._getJSONData();

  return call(app, {
    ...options,
    headers: { authorization: `Bearer ${accessToken}`, ...options.headers },
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
  const body = {
    operationId: "operation-route-001",
    arrivedAt: "2026-09-20T12:00:00.000Z",
    location: { latitude: -3.119, longitude: -60.021, accuracy: 12.5 },
  };
  const first = await request({
    method: "POST",
    url: "/visits/visit-001/start",
    body,
  });
  const second = await request({
    method: "POST",
    url: "/visits/visit-001/start",
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
