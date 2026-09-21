import { AppShell } from "../src/shared/ui/AppShell";
import { useRouter } from "expo-router";
import type { VisitDetails } from "@qqs/contracts";

import { VisitsScreen } from "../src/modules/visits/VisitsScreen";

const visits: VisitDetails[] = [
  {
    id: "visit-001",
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
  },
];

export default function Index() {
  const router = useRouter();
  return (
    <AppShell>
      <VisitsScreen
        visits={visits}
        onOpen={(id) => router.push(`/visit/${id}` as never)}
      />
    </AppShell>
  );
}
