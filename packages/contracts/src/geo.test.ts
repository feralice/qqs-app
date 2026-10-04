import { test } from "node:test";
import assert from "node:assert/strict";

import { distanceMeters } from "./index.js";

test("distanceMeters is zero for the same point", () => {
  const point = { latitude: -3.1019, longitude: -60.025 };
  assert.equal(distanceMeters(point, point), 0);
});

test("distanceMeters matches a known Manaus distance", () => {
  // Teatro Amazonas até a Ponta Negra, referência calculada fora do projeto.
  const distance = distanceMeters(
    { latitude: -3.1303, longitude: -60.0234 },
    { latitude: -3.0662, longitude: -60.1033 },
  );
  assert.equal(distance, 11_380);
});

test("distanceMeters is symmetric and rounds to whole meters", () => {
  const a = { latitude: -3.1, longitude: -60.0 };
  const b = { latitude: -3.1009, longitude: -60.0 };
  assert.equal(distanceMeters(a, b), 100);
  assert.equal(distanceMeters(b, a), 100);
});
