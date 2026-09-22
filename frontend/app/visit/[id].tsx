import { useLocalSearchParams } from "expo-router";

import { AppShell } from "../../src/shared/ui/AppShell";
import { useAuth } from "../../src/modules/auth/AuthContext";
import { ExpoLocationProvider } from "../../src/modules/location/expo-location-provider";
import { VisitDetailsScreen } from "../../src/modules/visits/VisitDetailsScreen";
import { createVisitApi } from "../../src/modules/visits/visit-api";

export default function VisitRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const visitId = id ?? "visit-001";
  return (
    <AppShell>
      <VisitDetailsScreen
        api={createVisitApi(accessToken)}
        locationProvider={new ExpoLocationProvider()}
        employeeId={user?.id}
        visit={{
          id: visitId,
          clientId: "client-001",
          clientName: "Gases da Amazônia",
          scheduledFor: "2026-09-21T13:00:00.000Z",
          status: "assigned",
          systemsCount: 3,
          systems: [
            { id: "system-001", name: "Torre 1", type: "tower" },
            { id: "system-002", name: "Torre 2", type: "tower" },
            { id: "system-003", name: "Caldeira 1", type: "boiler" },
          ],
          syncStatus: "pending",
        }}
      />
    </AppShell>
  );
}
