import { test } from "node:test";
import assert from "node:assert/strict";

import type { LocationProvider } from "../location/location-provider";
import { evaluateArrival } from "./arrival";

const client = { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 };

const at = (latitude: number, longitude: number): LocationProvider => ({
  getArrivalLocation: async () => ({ status: "granted", location: { latitude, longitude } }),
});

test("evaluateArrival inside the radius is not flagged", async () => {
  const result = await evaluateArrival(at(-3.102, -60.0251), client);
  assert.deepEqual(result, {
    location: { latitude: -3.102, longitude: -60.0251 },
    locationStatus: "granted",
    distanceMeters: 16,
    outsideRadius: false,
  });
});

test("evaluateArrival outside the radius reports the distance", async () => {
  const result = await evaluateArrival(at(-3.119, -60.021), client);
  assert.equal(result.outsideRadius, true);
  assert.equal(result.distanceMeters, 1953);
});

test("evaluateArrival without GPS permission counts as outside the radius", async () => {
  const result = await evaluateArrival({ getArrivalLocation: async () => ({ status: "denied" }) }, client);
  assert.deepEqual(result, { location: undefined, locationStatus: "denied", distanceMeters: undefined, outsideRadius: true });
});

test("evaluateArrival when the GPS call throws counts as unavailable", async () => {
  const result = await evaluateArrival(
    {
      getArrivalLocation: async () => {
        throw new Error("timeout");
      },
    },
    client,
  );
  assert.equal(result.locationStatus, "unavailable");
  assert.equal(result.outsideRadius, true);
});

test("evaluateArrival without company coordinates does not block the check-in", async () => {
  const result = await evaluateArrival(at(-3.119, -60.021), undefined);
  assert.equal(result.outsideRadius, false);
  assert.equal(result.distanceMeters, undefined);
});
