import * as ExpoLocation from "expo-location";

import type { LocationProvider, LocationResult } from "./location-provider.js";

export class ExpoLocationProvider implements LocationProvider {
  async getArrivalLocation(): Promise<LocationResult> {
    const permission = await ExpoLocation.requestForegroundPermissionsAsync();
    if (permission.status !== ExpoLocation.PermissionStatus.GRANTED) {
      return { status: "denied" };
    }

    try {
      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      return {
        status: "granted",
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
        },
      };
    } catch {
      return { status: "unavailable" };
    }
  }
}
