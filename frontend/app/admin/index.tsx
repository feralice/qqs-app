import { AppShell } from "../../src/shared/ui/AppShell";
import { AdminHomeScreen } from "../../src/modules/admin/AdminHomeScreen";

export default function AdminIndex() {
  return (
    <AppShell>
      <AdminHomeScreen />
    </AppShell>
  );
}
