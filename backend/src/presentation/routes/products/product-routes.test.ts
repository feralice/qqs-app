import { test } from "node:test";
import assert from "node:assert/strict";

import { authedCall, createTestApp, login } from "../../../test-support/http.js";

async function setup() {
  const app = await createTestApp();
  return { app, admin: await login(app, "supervisor"), technician: await login(app, "employee") };
}

test("technician lists the catalog but cannot change it", async () => {
  const { app, technician } = await setup();
  const list = await authedCall(app, technician, { method: "GET", url: "/products" });
  assert.equal(list.statusCode, 200);
  assert.equal(list._getJSONData().items.length, 8);

  const create = await authedCall(app, technician, { method: "POST", url: "/products", body: { name: "QQS XYZ" } });
  assert.equal(create.statusCode, 403);
  const patch = await authedCall(app, technician, { method: "PATCH", url: "/products/product-inp", body: { active: false } });
  assert.equal(patch.statusCode, 403);
});

test("supervisor creates, renames and deactivates a product", async () => {
  const { app, admin } = await setup();
  const created = await authedCall(app, admin, {
    method: "POST",
    url: "/products",
    body: { name: "QQS ZN", description: "Zinco", unit: "kg" },
  });
  assert.equal(created.statusCode, 201);
  assert.deepEqual({ ...created._getJSONData(), id: undefined }, {
    id: undefined,
    name: "QQS ZN",
    description: "Zinco",
    unit: "kg",
    active: true,
  });

  const duplicated = await authedCall(app, admin, { method: "POST", url: "/products", body: { name: "qqs inp" } });
  assert.equal(duplicated.statusCode, 409);
  const badUnit = await authedCall(app, admin, { method: "POST", url: "/products", body: { name: "QQS A", unit: "saco" } });
  assert.equal(badUnit.statusCode, 400);

  const patch = await authedCall(app, admin, { method: "PATCH", url: "/products/product-inp", body: { active: false } });
  assert.equal(patch.statusCode, 200);
  assert.equal(patch._getJSONData().active, false);
  const missing = await authedCall(app, admin, { method: "PATCH", url: "/products/nope", body: { active: false } });
  assert.equal(missing.statusCode, 404);

  const all = await authedCall(app, admin, { method: "GET", url: "/products?includeInactive=true" });
  assert.equal(all._getJSONData().items.length, 9);
});

test("technician reads the client program and only the supervisor replaces it", async () => {
  const { app, admin, technician } = await setup();
  const program = await authedCall(app, technician, { method: "GET", url: "/clients/client-001/program" });
  assert.equal(program.statusCode, 200);
  const tower = program._getJSONData().systems.find((system: { systemId: string }) => system.systemId === "system-001");
  assert.deepEqual(tower.parameters, [{ name: "pH", min: 6.8, max: 8.2 }]);
  assert.deepEqual(
    tower.products.map((product: { productName: string }) => product.productName),
    ["QQS INP", "QQS BIO"],
  );

  const body = {
    parameters: [{ name: "Nitrito", unit: "ppm", min: 200, max: 400 }],
    products: [{ productId: "product-nss", dailyDose: 1.2 }],
  };
  const forbidden = await authedCall(app, technician, {
    method: "PUT",
    url: "/clients/client-001/systems/system-003/program",
    body,
  });
  assert.equal(forbidden.statusCode, 403);

  const replaced = await authedCall(app, admin, { method: "PUT", url: "/clients/client-001/systems/system-003/program", body });
  assert.equal(replaced.statusCode, 200);
  assert.equal(replaced._getJSONData().systemName, "Caldeira 1");
  assert.equal(replaced._getJSONData().products[0].unit, "kg");
});

test("program replacement reports wrong systems, ranges and products", async () => {
  const { app, admin } = await setup();
  const put = (url: string, body: Record<string, unknown>) => authedCall(app, admin, { method: "PUT", url, body });
  const url = "/clients/client-001/systems/system-001/program";

  assert.equal((await put("/clients/client-001/systems/nope/program", { parameters: [], products: [] })).statusCode, 404);
  assert.equal((await put("/clients/nope/systems/system-001/program", { parameters: [], products: [] })).statusCode, 404);
  assert.equal((await put(url, { parameters: [{ name: "pH", min: 9, max: 8 }], products: [] })).statusCode, 400);
  assert.equal((await put(url, { parameters: [{ name: "pH", min: "7" }], products: [] })).statusCode, 400);
  assert.equal((await put(url, { parameters: [], products: [{ productId: "nope", dailyDose: 1 }] })).statusCode, 422);
  assert.equal(
    (
      await put(url, {
        parameters: [],
        products: [
          { productId: "product-inp", dailyDose: 1 },
          { productId: "product-inp", dailyDose: 2 },
        ],
      })
    ).statusCode,
    409,
  );
});
