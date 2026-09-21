import { useLocalSearchParams } from "expo-router";

import { ExpoLocationProvider } from "../../src/modules/location/expo-location-provider";
import { VisitDetailsScreen } from "../../src/modules/visits/VisitDetailsScreen";
import { createVisitApi } from "../../src/modules/visits/visit-api";

export default function VisitRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const visitId = id ?? "visit-001";
  return (
    <VisitDetailsScreen
      api={createVisitApi()}
      locationProvider={new ExpoLocationProvider()}
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
  );
}
