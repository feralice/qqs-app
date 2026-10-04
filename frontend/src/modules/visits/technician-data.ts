import type { ClientSummary, UserId, VisitDetails } from "@qqs/contracts";

import type { ClientApi } from "../clients/client-api";
import type { LocalCache } from "../sync/local-cache";
import { createLocalId } from "../sync/local-id";
import type { SyncQueue } from "../sync/sync-queue";
import { syncPending, type SyncApi } from "../sync/sync-runner";
import type { TechnicianVisitDraft } from "./TechnicianCreateVisitModal";
import type { VisitApi } from "./visit-api";
import type { VisitStore } from "./visit-store";

export type DeviceData = {
  queue: SyncQueue;
  store: VisitStore;
  clientsCache: LocalCache<ClientSummary[]>;
};

export type TechnicianSnapshot = {
  visits: VisitDetails[];
  clients: ClientSummary[];
  pendingSyncCount: number;
  rejectedSyncCount: number;
  online: boolean;
};

const CLIENTS_KEY = "all";

// Envia a fila primeiro e só depois baixa a lista, para o servidor já conhecer o que foi feito offline.
export async function refreshTechnicianData(
  deps: DeviceData & {
    visitApi: SyncApi & Pick<VisitApi, "listVisits">;
    clientApi: Pick<ClientApi, "listClients">;
  },
): Promise<TechnicianSnapshot> {
  await syncPending(deps.queue, deps.visitApi);

  let online = true;
  try {
    const items = await deps.visitApi.listVisits();
    // Lido só depois da resposta: um check-in feito durante o download não pode ser sobrescrito.
    const unsyncedIds = [...deps.queue.pending(), ...deps.queue.rejected()].map((operation) => operation.entityId);
    await deps.store.setAll(items, unsyncedIds);
  } catch {
    online = false;
  }

  let clients = (await deps.clientsCache.read(CLIENTS_KEY)) ?? [];
  try {
    clients = await deps.clientApi.listClients();
    await deps.clientsCache.write(CLIENTS_KEY, clients);
  } catch {
    online = false;
  }

  return {
    visits: deps.store.list(),
    clients,
    pendingSyncCount: deps.queue.pending().length,
    rejectedSyncCount: deps.queue.rejected().length,
    online,
  };
}

export async function createOfflineVisit(
  deps: DeviceData & { draft: TechnicianVisitDraft; employeeId: UserId },
): Promise<VisitDetails> {
  const { client, scheduledFor } = deps.draft;
  const id = createLocalId();
  const visit: VisitDetails = {
    id,
    clientId: client.id,
    employeeId: deps.employeeId,
    clientName: client.name,
    clientAddress: client.address,
    clientLocation: { latitude: client.latitude, longitude: client.longitude, radiusMeters: client.radiusMeters },
    scheduledFor,
    status: "assigned",
    systemsCount: client.systems.length,
    systems: client.systems.map(({ id: systemId, name, type }) => ({ id: systemId, name, type })),
    syncStatus: "pending",
  };
  await deps.store.set(visit);
  await deps.queue.enqueue({
    operationId: `visit-create:${id}`,
    entityId: id,
    type: "visit.create",
    payload: { id, clientId: client.id, scheduledFor },
  });
  return visit;
}
