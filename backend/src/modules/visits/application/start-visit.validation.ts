import type { ArrivalLocation } from "@qqs/contracts";

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
