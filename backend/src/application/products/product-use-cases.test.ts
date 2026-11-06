import { test } from "node:test";
import assert from "node:assert/strict";

import { createTestDatabase } from "../../infrastructure/db/test-database.js";
import { DrizzleClientRepository } from "../../infrastructure/persistence/drizzle-client-repository.js";
import { DrizzleProductRepository } from "../../infrastructure/persistence/drizzle-product-repository.js";
import { DrizzleProgramRepository } from "../../infrastructure/persistence/drizzle-program-repository.js";
import { ClientNotFoundError } from "../../domain/clients/client.js";
import { ProductNameTakenError, ProductNotFoundError } from "../../domain/products/product.js";
import { createClient } from "../clients/commands/create-client.js";
import { createProduct, updateProduct } from "./commands/product-commands.js";
import { replaceSystemProgram } from "./commands/replace-system-program.js";
import { listProducts } from "./queries/list-products.js";
import { getClientProgram } from "./queries/get-client-program.js";
import { InactiveProductError, SystemNotInClientError, UnknownProductError } from "./errors.js";

const supervisor = { sub: "admin-1", role: "supervisor" as const };
const technician = { sub: "employee-001", role: "employee" as const };

async function setup() {
  const db = await createTestDatabase();
  const deps = {
    clients: new DrizzleClientRepository(db),
    products: new DrizzleProductRepository(db),
    programs: new DrizzleProgramRepository(db),
  };
  const client = await createClient(deps.clients, {
    name: "Gases da Amazônia",
    cnpj: "11.222.333/0001-81",
    address: "Manaus",
    latitude: -3.1,
    longitude: -60,
    radiusMeters: 200,
    systems: [
      { name: "Torre 1", type: "tower" },
      { name: "Chiller 1", type: "chiller" },
    ],
  });
  const other = await createClient(deps.clients, {
    name: "Ambev Manaus",
    cnpj: "00.000.000/0001-91",
    address: "Manaus",
    latitude: -3.1,
    longitude: -60,
    radiusMeters: 200,
    systems: [{ name: "Torre 1", type: "tower" }],
  });
  const tower = client.systems.find((system) => system.name === "Torre 1")!;
  const inp = await createProduct(deps.products, { name: "QQS INP", description: "Inibidor de corrosão" });
  const nss = await createProduct(deps.products, { name: "QQS NSS", unit: "kg" });
  return { ...deps, client, other, tower, inp, nss };
}

test("createProduct rejects a name already used with other casing", async () => {
  const { products } = await setup();
  await assert.rejects(createProduct(products, { name: "qqs inp" }), ProductNameTakenError);
});

test("updateProduct renames, deactivates and refuses unknown ids", async () => {
  const { products, inp, nss } = await setup();
  const updated = await updateProduct(products, inp.id, { unit: "kg", active: false });
  assert.equal(updated.unit, "kg");
  assert.equal(updated.active, false);
  assert.equal(updated.name, "QQS INP");
  await assert.rejects(updateProduct(products, nss.id, { name: "QQS INP" }), ProductNameTakenError);
  await assert.rejects(updateProduct(products, "missing", { active: true }), ProductNotFoundError);
});

test("listProducts hides inactive products unless a supervisor asks", async () => {
  const { products, inp } = await setup();
  await updateProduct(products, inp.id, { active: false });
  assert.deepEqual((await listProducts(products, technician, { includeInactive: true })).map((p) => p.name), ["QQS NSS"]);
  assert.deepEqual(
    (await listProducts(products, supervisor, { includeInactive: true })).map((p) => p.name),
    ["QQS INP", "QQS NSS"],
  );
});

test("replaceSystemProgram stores the program and getClientProgram returns every system", async () => {
  const deps = await setup();
  const { client, tower, inp, nss } = deps;
  const saved = await replaceSystemProgram(deps, client.id, tower.id, {
    parameters: [
      { name: "pH", min: 6.8, max: 8.2 },
      { name: "Condutividade", unit: "µS/cm", max: 1500 },
    ],
    products: [
      { productId: nss.id, dailyDose: 3, maintenanceDose: 1.5 },
      { productId: inp.id, dailyDose: 2 },
    ],
  });
  assert.deepEqual(saved.products, [
    { productId: nss.id, productName: "QQS NSS", unit: "kg", productActive: true, dailyDose: 3, maintenanceDose: 1.5 },
    { productId: inp.id, productName: "QQS INP", unit: "L", productActive: true, dailyDose: 2 },
  ]);

  const program = await getClientProgram(deps, client.id);
  assert.deepEqual(
    program.systems.map((system) => [system.systemName, system.parameters.length, system.products.length]),
    [
      ["Chiller 1", 0, 0],
      ["Torre 1", 2, 2],
    ],
  );
  assert.deepEqual(program.systems[1].parameters[1], { name: "Condutividade", unit: "µS/cm", max: 1500 });

  await replaceSystemProgram(deps, client.id, tower.id, { parameters: [{ name: "pH", min: 7 }], products: [] });
  const replaced = (await getClientProgram(deps, client.id)).systems[1];
  assert.deepEqual(replaced.parameters, [{ name: "pH", min: 7 }]);
  assert.deepEqual(replaced.products, []);
});

test("replaceSystemProgram refuses a system that belongs to another client", async () => {
  const deps = await setup();
  await assert.rejects(
    replaceSystemProgram(deps, deps.client.id, deps.other.systems[0].id, { parameters: [], products: [] }),
    SystemNotInClientError,
  );
  await assert.rejects(
    replaceSystemProgram(deps, "missing", deps.tower.id, { parameters: [], products: [] }),
    ClientNotFoundError,
  );
});

test("replaceSystemProgram refuses unknown products and new inactive ones but keeps existing inactive ones", async () => {
  const deps = await setup();
  const { client, tower, inp, nss, products } = deps;
  await assert.rejects(
    replaceSystemProgram(deps, client.id, tower.id, { parameters: [], products: [{ productId: "missing", dailyDose: 1 }] }),
    UnknownProductError,
  );

  await replaceSystemProgram(deps, client.id, tower.id, { parameters: [], products: [{ productId: inp.id, dailyDose: 1 }] });
  await updateProduct(products, inp.id, { active: false });
  await updateProduct(products, nss.id, { active: false });

  const kept = await replaceSystemProgram(deps, client.id, tower.id, {
    parameters: [],
    products: [{ productId: inp.id, dailyDose: 4 }],
  });
  assert.deepEqual(kept.products.map((product) => [product.productName, product.productActive, product.dailyDose]), [
    ["QQS INP", false, 4],
  ]);
  await assert.rejects(
    replaceSystemProgram(deps, client.id, tower.id, { parameters: [], products: [{ productId: nss.id, dailyDose: 1 }] }),
    InactiveProductError,
  );
});
