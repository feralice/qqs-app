import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";

import { AppShell } from "../../../src/shared/ui/AppShell";
import { useAuth } from "../../../src/modules/auth/AuthContext";
import { createProductApi } from "../../../src/modules/products/product-api";
import { ProgramScreen } from "../../../src/modules/products/ProgramScreen";

export default function AdminClientProgram() {
  const { clientId, name } = useLocalSearchParams<{ clientId: string; name?: string }>();
  const { accessToken } = useAuth();
  const api = useMemo(() => createProductApi(accessToken), [accessToken]);
  return (
    <AppShell>
      <ProgramScreen api={api} clientId={clientId} clientName={name} />
    </AppShell>
  );
}
