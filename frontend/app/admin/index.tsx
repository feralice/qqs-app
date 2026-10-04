import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { ClientSummary, EmployeeSummary, VisitDetails } from "@qqs/contracts";

import { AppShell } from "../../src/shared/ui/AppShell";
import { AdminHomeScreen } from "../../src/modules/admin/AdminHomeScreen";
import { useAuth } from "../../src/modules/auth/AuthContext";
import { createClientApi } from "../../src/modules/clients/client-api";
import { createLocalId } from "../../src/modules/sync/local-id";
import { createVisitApi } from "../../src/modules/visits/visit-api";

export default function AdminIndex() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const visitApi = useMemo(() => createVisitApi(accessToken), [accessToken]);
  const clientApi = useMemo(() => createClientApi(accessToken), [accessToken]);
  const [visits, setVisits] = useState<VisitDetails[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);

  const load = useCallback(async () => {
    const [nextVisits, nextEmployees, nextClients] = await Promise.allSettled([
      visitApi.listVisits(),
      visitApi.listEmployees(),
      clientApi.listClients(),
    ]);
    if (nextVisits.status === "fulfilled") setVisits(nextVisits.value);
    if (nextEmployees.status === "fulfilled") setEmployees(nextEmployees.value.filter((item) => item.role === "employee"));
    if (nextClients.status === "fulfilled") setClients(nextClients.value);
  }, [visitApi, clientApi]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <AppShell>
      <AdminHomeScreen
        visits={visits}
        employees={employees}
        clients={clients}
        onOpenClients={() => router.push("/admin/clients" as never)}
        onScheduleVisit={async ({ client, employeeId, scheduledFor }) => {
          try {
            await visitApi.createVisit({ id: createLocalId(), clientId: client.id, employeeId, scheduledFor });
            await load();
          } catch {
            Alert.alert("Não foi possível agendar", "Verifique a conexão e tente novamente.");
          }
        }}
      />
    </AppShell>
  );
}
