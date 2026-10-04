import { test } from "node:test";
import assert from "node:assert/strict";

import { withLocationTimeout, type LocationProvider, type LocationResult } from "./location-provider";

test("location provider exposes a granted result without native API details", async () => {
  const provider: LocationProvider = {
    getArrivalLocation: async (): Promise<LocationResult> => ({
      status: "granted",
      location: { latitude: -3.119, longitude: -60.021, accuracy: 10 },
    }),
  };

  const result = await provider.getArrivalLocation();

  assert.equal(result.status, "granted");
  assert.equal(result.location?.latitude, -3.119);
});

test("location provider can represent denied permission", async () => {
  const provider: LocationProvider = {
    getArrivalLocation: async () => ({ status: "denied" }),
  };

  assert.deepEqual(await provider.getArrivalLocation(), { status: "denied" });
});

test("withLocationTimeout reports unavailable when the GPS never answers", async () => {
  const hanging: LocationProvider = { getArrivalLocation: () => new Promise(() => {}) };
  const started = Date.now();

  const result = await withLocationTimeout(hanging, 30).getArrivalLocation();

  assert.equal(result.status, "unavailable");
  assert.ok(Date.now() - started < 1000);
});

test("withLocationTimeout passes a fast answer through", async () => {
  const fast: LocationProvider = {
    getArrivalLocation: async () => ({ status: "granted", location: { latitude: -3.1, longitude: -60 } }),
  };
  assert.equal((await withLocationTimeout(fast, 1000).getArrivalLocation()).status, "granted");
});
