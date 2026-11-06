import { test } from "node:test";
import assert from "node:assert/strict";

import { DuplicateProgramEntryError, InvalidProductError, InvalidProgramError, validateProduct, validateSystemProgram } from "./product.js";

test("validateProduct trims fields and defaults the unit to liters", () => {
  assert.deepEqual(validateProduct({ id: "p1", name: "  QQS INP ", description: " Inibidor ", active: true }), {
    id: "p1",
    name: "QQS INP",
    description: "Inibidor",
    unit: "L",
    active: true,
  });
  assert.equal(validateProduct({ id: "p1", name: "QQS ALC", unit: "kg", active: true }).unit, "kg");
  assert.equal(validateProduct({ id: "p1", name: "QQS ALC", description: "  ", active: true }).description, undefined);
});

test("validateProduct rejects empty names and unknown units", () => {
  assert.throws(() => validateProduct({ id: "p1", name: " ", active: true }), InvalidProductError);
  assert.throws(() => validateProduct({ id: "p1", name: "QQS", unit: "bombona" as never, active: true }), InvalidProductError);
});

const tower = {
  parameters: [
    { name: " pH ", min: 6.8, max: 8.2 },
    { name: "Cloro", unit: " ppm ", max: 1 },
  ],
  products: [
    { productId: "p1", dailyDose: 2.5, maintenanceDose: 1 },
    { productId: "p2", dailyDose: 0.4 },
  ],
};

test("validateSystemProgram normalizes parameters and keeps order", () => {
  const program = validateSystemProgram(tower);
  assert.deepEqual(program.parameters, [
    { name: "pH", min: 6.8, max: 8.2 },
    { name: "Cloro", unit: "ppm", max: 1 },
  ]);
  assert.deepEqual(
    program.products.map((product) => product.productId),
    ["p1", "p2"],
  );
});

test("validateSystemProgram rejects ranges and doses that make no sense", () => {
  const invalid = [
    { ...tower, parameters: [{ name: "pH" }] },
    { ...tower, parameters: [{ name: "pH", min: 9, max: 8 }] },
    { ...tower, parameters: [{ name: "", min: 1 }] },
    { ...tower, parameters: [{ name: "pH", min: Number.NaN }] },
    { ...tower, products: [{ productId: "p1", dailyDose: 0 }] },
    { ...tower, products: [{ productId: "p1", dailyDose: 1, maintenanceDose: -1 }] },
    { ...tower, products: [{ productId: " ", dailyDose: 1 }] },
  ];
  for (const program of invalid) {
    assert.throws(() => validateSystemProgram(program), InvalidProgramError, JSON.stringify(program));
  }
});

test("validateSystemProgram rejects repeated parameters and products", () => {
  assert.throws(
    () => validateSystemProgram({ ...tower, parameters: [{ name: "pH", min: 1 }, { name: "PH", max: 2 }] }),
    DuplicateProgramEntryError,
  );
  assert.throws(
    () => validateSystemProgram({ ...tower, products: [{ productId: "p1", dailyDose: 1 }, { productId: "p1", dailyDose: 2 }] }),
    DuplicateProgramEntryError,
  );
});
