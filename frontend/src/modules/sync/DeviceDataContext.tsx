import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "../auth/AuthContext";
import type { DeviceData } from "../visits/technician-data";
import { openDeviceData } from "./device-data";
import { deviceStorage } from "./device-storage";
import type { KeyValueStorage } from "./key-value-storage";

const DeviceDataContext = createContext<DeviceData | undefined>(undefined);

export function DeviceDataProvider({
  children,
  storage = deviceStorage,
}: {
  children: ReactNode;
  storage?: KeyValueStorage;
}) {
  const { user } = useAuth();
  const [data, setData] = useState<DeviceData>();

  useEffect(() => {
    setData(undefined);
    if (!user) return;
    let active = true;
    openDeviceData(storage, user.id).then((opened) => {
      if (active) setData(opened);
    });
    return () => {
      active = false;
    };
  }, [storage, user?.id]);

  return <DeviceDataContext.Provider value={data}>{children}</DeviceDataContext.Provider>;
}

// undefined sem login ou enquanto o armazenamento local ainda está abrindo.
export function useDeviceData(): DeviceData | undefined {
  return useContext(DeviceDataContext);
}
