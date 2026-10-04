import type { ClientSummary, UserId } from "@qqs/contracts";

import { VisitStore } from "../visits/visit-store";
import type { DeviceData } from "../visits/technician-data";
import type { KeyValueStorage } from "./key-value-storage";
import { createPersistentLocalCache } from "./local-cache";
import { SyncQueue } from "./sync-queue";

// Chaves por usuário: num tablet compartilhado, a fila de um técnico não pode ser enviada com o login de outro.
export async function openDeviceData(storage: KeyValueStorage, userId: UserId): Promise<DeviceData> {
  const [queue, store] = await Promise.all([
    SyncQueue.open(storage, `${userId}:sync-queue`),
    VisitStore.open(storage, `${userId}:visits`),
  ]);
  return { queue, store, clientsCache: createPersistentLocalCache<ClientSummary[]>(storage, `${userId}:clients`) };
}
