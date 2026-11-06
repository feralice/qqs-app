import { useMemo } from "react";

import { AppShell } from "../../src/shared/ui/AppShell";
import { useAuth } from "../../src/modules/auth/AuthContext";
import { createProductApi } from "../../src/modules/products/product-api";
import { ProductsScreen } from "../../src/modules/products/ProductsScreen";

export default function AdminProducts() {
  const { accessToken } = useAuth();
  const api = useMemo(() => createProductApi(accessToken), [accessToken]);
  return (
    <AppShell>
      <ProductsScreen api={api} />
    </AppShell>
  );
}
