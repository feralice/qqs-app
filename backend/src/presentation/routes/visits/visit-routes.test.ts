import { test } from "node:test";
import assert from "node:assert/strict";
import type { RequestOptions } from "node-mocks-http";

import { authedCall, call, createTestApp, login, type TestRole } from "../../../test-support/http.js";

// Cada teste ganha seu próprio app + login, pra não depender de estado de outro teste.
async function request(options: RequestOptions, role: TestRole = "employee") {
  const app = await createTestApp();
  return authedCall(app, await login(app, role), options);
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
  const app = await createTestApp();
  const token = await login(app, "employee");
  const body = {
    operationId: "operation-route-001",
    arrivedAt: "2026-09-20T12:00:00.000Z",
    location: { latitude: -3.102, longitude: -60.0251, accuracy: 12.5 },
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
  const app = await createTestApp();
  const token = await login(app, "employee");

  await call(app, {
    method: "POST",
    url: "/visits/visit-001/start",
    headers: { authorization: `Bearer ${token}` },
    body: {
      operationId: "op-start-finish-test",
      arrivedAt: "2026-09-22T13:00:00.000Z",
      location: { latitude: -3.102, longitude: -60.0251 },
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
      clientId: "client-001",
      employeeId: "employee-002",
      scheduledFor: "2026-09-23T10:00:00.000Z",
    },
  }, "supervisor");

  assert.equal(response.statusCode, 201);
  const data = response._getJSONData();
  assert.ok(data.id);
  assert.equal(data.clientName, "Gases da Amazônia");
  assert.equal(data.employeeId, "employee-002");
  assert.equal(data.status, "assigned");
  assert.equal(data.systemsCount, 3);
  assert.deepEqual(data.clientLocation, { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 });
});

test("POST /visits allows a technician to create a visit assigned to themselves", async () => {
  const response = await request({
    method: "POST",
    url: "/visits",
    body: {
      clientId: "client-001",
      scheduledFor: "2026-09-24T11:00:00.000Z",
      employeeId: "employee-002",
      systems: [],
    },
  }, "employee");

  assert.equal(response.statusCode, 201);
  assert.equal(response._getJSONData().employeeId, "employee-001");
  assert.equal(response._getJSONData().clientName, "Gases da Amazônia");
});

test("POST /admin/visits/:id/reschedule allows supervisor to change the schedule idempotently", async () => {
  const app = await createTestApp();
  const token = await login(app, "supervisor");
  const options = {
    method: "POST" as const,
    url: "/admin/visits/visit-001/reschedule",
    headers: { authorization: `Bearer ${token}` },
    body: { operationId: "admin-reschedule-1", scheduledFor: "2026-09-28T10:00:00.000Z" },
  };

  const first = await call(app, options);
  const second = await call(app, options);

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.deepEqual(second._getJSONData(), first._getJSONData());
  assert.equal(first._getJSONData().scheduledFor, "2026-09-28T10:00:00.000Z");
});

test("GET /admin/dashboard returns the supervisor summary", async () => {
  const response = await request({ method: "GET", url: "/admin/dashboard?date=2026-09-21" }, "supervisor");

  assert.equal(response.statusCode, 200);
  assert.equal(response._getJSONData().date, "2026-09-21");
  assert.equal(response._getJSONData().counts.scheduled, 1);
});

const outside = { latitude: -3.119, longitude: -60.021 };

test("POST /visits/:id/start inside the radius is not flagged", async () => {
  const response = await request({
    method: "POST",
    url: "/visits/visit-001/start",
    body: { operationId: "op-inside", arrivedAt: "2026-09-21T13:02:00.000Z", location: { latitude: -3.102, longitude: -60.0251 } },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response._getJSONData().arrival.outsideRadius, false);
  assert.equal(response._getJSONData().arrival.distanceMeters, 16);
});

test("POST /visits/:id/start outside the radius requires a justification", async () => {
  const app = await createTestApp();
  const token = await login(app, "employee");
  const start = (body: object) => authedCall(app, token, { method: "POST", url: "/visits/visit-001/start", body });

  const rejected = await start({ operationId: "op-out-1", arrivedAt: "2026-09-21T13:02:00.000Z", location: outside });
  assert.equal(rejected.statusCode, 422);
  assert.equal(rejected._getJSONData().error, "justification required");

  const accepted = await start({
    operationId: "op-out-2",
    arrivedAt: "2026-09-21T13:02:00.000Z",
    location: outside,
    justification: "Portaria fica longe da planta",
  });
  assert.equal(accepted.statusCode, 200);
  assert.equal(accepted._getJSONData().arrival.outsideRadius, true);
  assert.equal(accepted._getJSONData().arrival.justification, "Portaria fica longe da planta");
});

test("POST /visits with the same device id twice does not duplicate the visit", async () => {
  const app = await createTestApp();
  const token = await login(app, "employee");
  const body = { id: "3f6c1d1e-7a55-4e0b-9a7e-2f1b9c3d4e5f", clientId: "client-001", scheduledFor: "2026-09-25T09:00:00.000Z" };

  const first = await authedCall(app, token, { method: "POST", url: "/visits", body });
  const retry = await authedCall(app, token, { method: "POST", url: "/visits", body });

  assert.equal(first.statusCode, 201);
  assert.equal(retry.statusCode, 200);
  const list = await authedCall(app, token, { method: "GET", url: "/visits" });
  assert.equal(list._getJSONData().items.filter((item: { id: string }) => item.id === body.id).length, 1);
});

test("POST /visits rejects an unknown or inactive company", async () => {
  const app = await createTestApp();
  const admin = await login(app, "supervisor");
  const unknown = await authedCall(app, admin, { method: "POST", url: "/visits", body: { clientId: "missing", employeeId: "employee-001" } });
  assert.equal(unknown.statusCode, 404);

  await authedCall(app, admin, { method: "PATCH", url: "/clients/client-001", body: { active: false } });
  const inactive = await authedCall(app, admin, { method: "POST", url: "/visits", body: { clientId: "client-001", employeeId: "employee-001" } });
  assert.equal(inactive.statusCode, 404);
});

test("POST /visits rejects an unknown technician chosen by the supervisor", async () => {
  const response = await request(
    { method: "POST", url: "/visits", body: { clientId: "client-001", employeeId: "ghost" } },
    "supervisor",
  );
  assert.equal(response.statusCode, 400);
});

test("GET /visits shows a technician only their own visits", async () => {
  const app = await createTestApp();
  const carlos = await login(app, "employee", { email: "carlos.silva@qqs.app", password: "Tecnico123!" });
  const admin = await login(app, "supervisor");

  const own = await authedCall(app, carlos, { method: "GET", url: "/visits" });
  assert.deepEqual(own._getJSONData().items, []);
  const all = await authedCall(app, admin, { method: "GET", url: "/visits" });
  assert.equal(all._getJSONData().items.length, 1);
  assert.equal(all._getJSONData().items[0].clientLocation.radiusMeters, 200);
});

test("GET /visits/:id hides another technician's visit", async () => {
  const app = await createTestApp();
  const carlos = await login(app, "employee", { email: "carlos.silva@qqs.app", password: "Tecnico123!" });
  const response = await authedCall(app, carlos, { method: "GET", url: "/visits/visit-001" });
  assert.equal(response.statusCode, 404);
});

test("POST /visits/:id/finish on a visit that never started returns 409", async () => {
  const response = await request({
    method: "POST",
    url: "/visits/visit-001/finish",
    body: { operationId: "op-finish-first", finishedAt: "2026-09-21T14:00:00.000Z" },
  });
  assert.equal(response.statusCode, 409);
});

test("POST /visits replay with another technician's visit id reveals nothing", async () => {
  const app = await createTestApp();
  const carlos = await login(app, "employee", { email: "carlos.silva@qqs.app", password: "Tecnico123!" });
  const response = await authedCall(app, carlos, {
    method: "POST",
    url: "/visits",
    body: { id: "visit-001", clientId: "client-001" },
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response._getJSONData().clientName, undefined);
});
