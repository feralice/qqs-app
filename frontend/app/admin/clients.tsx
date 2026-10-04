import { useMemo } from "react";

import { AppShell } from "../../src/shared/ui/AppShell";
import { useAuth } from "../../src/modules/auth/AuthContext";
import { createClientApi } from "../../src/modules/clients/client-api";
import { ClientsScreen } from "../../src/modules/clients/ClientsScreen";

export default function AdminClients() {
  const { accessToken } = useAuth();
  const api = useMemo(() => createClientApi(accessToken), [accessToken]);
  return (
    <AppShell>
      <ClientsScreen api={api} />
    </AppShell>
  );
}
