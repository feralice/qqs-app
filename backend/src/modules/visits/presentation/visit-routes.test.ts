import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequest, createResponse } from "node-mocks-http";

import { createApp } from "../../../app.js";

async function request(options: Parameters<typeof createRequest>[0]) {
  const response = createResponse();
  await createApp()(createRequest(options), response);
  await new Promise((resolve) => setImmediate(resolve));
  return response;
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
