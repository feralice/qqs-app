import type { ArrivalLocation } from "@qqs/contracts";

export type { ArrivalLocation } from "@qqs/contracts";

export type LocationResult =
  | { status: "granted"; location: ArrivalLocation }
  | { status: "denied" | "unavailable"; location?: undefined };

export type LocationProvider = {
  getArrivalLocation(): Promise<LocationResult>;
};

export const ARRIVAL_LOCATION_TIMEOUT_MS = 15_000;

// Com permissão mas sem sinal (dentro da planta), o GPS pode nunca responder.
export function withLocationTimeout(provider: LocationProvider, timeoutMs = ARRIVAL_LOCATION_TIMEOUT_MS): LocationProvider {
  return {
    getArrivalLocation() {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<LocationResult>((resolve) => {
        timer = setTimeout(() => resolve({ status: "unavailable" }), timeoutMs);
      });
      return Promise.race([provider.getArrivalLocation(), timeout]).finally(() => clearTimeout(timer));
    },
  };
}
