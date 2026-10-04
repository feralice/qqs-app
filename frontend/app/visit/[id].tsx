import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { VisitDetails } from "@qqs/contracts";

import { AppShell } from "../../src/shared/ui/AppShell";
import { useAuth } from "../../src/modules/auth/AuthContext";
import { ExpoLocationProvider } from "../../src/modules/location/expo-location-provider";
import { withLocationTimeout } from "../../src/modules/location/location-provider";
import { useDeviceData } from "../../src/modules/sync/DeviceDataContext";
import { VisitDetailsScreen } from "../../src/modules/visits/VisitDetailsScreen";
import { createVisitApi } from "../../src/modules/visits/visit-api";

export default function VisitRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const device = useDeviceData();
  const api = useMemo(() => createVisitApi(accessToken), [accessToken]);
  const locationProvider = useMemo(() => withLocationTimeout(new ExpoLocationProvider()), []);
  const [visit, setVisit] = useState<VisitDetails | null>();

  useEffect(() => {
    if (!device || !id) return;
    const local = device.store.get(id);
    if (local) {
      setVisit(local);
      return;
    }
    api
      .getVisit(id)
      .then(async (remote) => {
        await device.store.set(remote);
        setVisit(remote);
      })
      .catch(() => setVisit(null));
  }, [device, id, api]);

  return (
    <AppShell>
      {visit === undefined || !device ? (
        <ActivityIndicator />
      ) : visit === null ? (
        <Text>Visita não encontrada neste aparelho.</Text>
      ) : (
        <VisitDetailsScreen
          key={visit.id}
          visit={visit}
          api={api}
          locationProvider={locationProvider}
          employeeId={user?.id}
          queue={device.queue}
          store={device.store}
        />
      )}
    </AppShell>
  );
}
