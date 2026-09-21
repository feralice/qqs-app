import type { ArrivalLocation } from "@qqs/contracts";

export type { ArrivalLocation } from "@qqs/contracts";

export type LocationResult =
  | { status: "granted"; location: ArrivalLocation }
  | { status: "denied" | "unavailable"; location?: undefined };

export type LocationProvider = {
  getArrivalLocation(): Promise<LocationResult>;
};
