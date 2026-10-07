import { distanceMeters, type ArrivalLocation, type ClientLocation } from "@qqs/contracts";

export function isValidArrivalData(
  arrivedAt: string,
  location?: ArrivalLocation,
): boolean {
  if (Number.isNaN(Date.parse(arrivedAt))) {
    return false;
  }

  if (!location) {
    return true;
  }

  return (
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    (location.accuracy === undefined || location.accuracy >= 0)
  );
}

// Sem GPS não há como conferir a distância: conta como fora do raio (RF-016).
export function evaluateRadius(
  client: ClientLocation,
  location?: ArrivalLocation,
): { distanceMeters?: number; outsideRadius: boolean } {
  if (!location) {
    return { distanceMeters: undefined, outsideRadius: true };
  }
  const distance = distanceMeters(client, location);
  return { distanceMeters: distance, outsideRadius: distance > client.radiusMeters };
}
