import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { AppShell } from "../src/shared/ui/AppShell";
import { useAuth } from "../src/modules/auth/AuthContext";
import { createClientApi } from "../src/modules/clients/client-api";
import { useDeviceData } from "../src/modules/sync/DeviceDataContext";
import { VisitsScreen } from "../src/modules/visits/VisitsScreen";
import {
  createOfflineVisit,
  refreshTechnicianData,
  type TechnicianSnapshot,
} from "../src/modules/visits/technician-data";
import { createVisitApi } from "../src/modules/visits/visit-api";

export default function Index() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const device = useDeviceData();
  const [snapshot, setSnapshot] = useState<TechnicianSnapshot>();
  const apis = useMemo(
    () => ({ visitApi: createVisitApi(accessToken), clientApi: createClientApi(accessToken) }),
    [accessToken],
  );

  const refresh = useCallback(async () => {
    if (!device) return;
    setSnapshot(await refreshTechnicianData({ ...device, ...apis }));
  }, [device, apis]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <AppShell>
      <VisitsScreen
        visits={snapshot?.visits ?? device?.store.list() ?? []}
        clients={snapshot?.clients ?? []}
        pendingSyncCount={snapshot?.pendingSyncCount ?? 0}
        rejectedSyncCount={snapshot?.rejectedSyncCount ?? 0}
        onSync={refresh}
        onOpen={(id) => router.push(`/visit/${id}` as never)}
        onCreateVisit={async (draft) => {
          if (!device || !user) return;
          await createOfflineVisit({ ...device, draft, employeeId: user.id });
          await refresh();
        }}
      />
    </AppShell>
  );
}
