import { test } from "node:test";
import assert from "node:assert/strict";

import type { LocationProvider, LocationResult } from "./location-provider.js";

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
