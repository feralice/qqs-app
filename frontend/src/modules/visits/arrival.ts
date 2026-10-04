import { distanceMeters, type ArrivalLocation, type ClientLocation } from "@qqs/contracts";

import type { LocationProvider, LocationResult } from "../location/location-provider";

export type ArrivalEvaluation = {
  location?: ArrivalLocation;
  locationStatus: LocationResult["status"];
  distanceMeters?: number;
  outsideRadius: boolean;
};

// Mesma regra do backend (evaluateRadius): sem GPS conta como fora do raio.
// Visita antiga sem coordenadas da empresa não bloqueia o check-in.
export async function evaluateArrival(
  provider: LocationProvider,
  clientLocation: ClientLocation | undefined,
): Promise<ArrivalEvaluation> {
  const result: LocationResult = await provider.getArrivalLocation().catch(() => ({ status: "unavailable" as const }));
  const location = result.location;
  if (!clientLocation) {
    return { location, locationStatus: result.status, distanceMeters: undefined, outsideRadius: false };
  }
  if (!location) {
    return { location: undefined, locationStatus: result.status, distanceMeters: undefined, outsideRadius: true };
  }
  const distance = distanceMeters(clientLocation, location);
  return {
    location,
    locationStatus: result.status,
    distanceMeters: distance,
    outsideRadius: distance > clientLocation.radiusMeters,
  };
}
