import type { ArrivalLocation, OperationId } from "@qqs/contracts";

import type { LocationProvider } from "../location/location-provider.js";
import type { SyncQueue } from "../sync/sync-queue.js";
import type { VisitApi } from "./visit-api.js";
import { VisitStore } from "./visit-store.js";

export type StartVisitInput = {
  visitId: string;
  clientId: string;
  employeeId: string;
  now: string;
  locationProvider: LocationProvider;
  queue: SyncQueue;
  store: VisitStore;
  api: Pick<VisitApi, "startVisit">;
};

function operationIdFor(visitId: string, arrivedAt: string): OperationId {
  return `visit-start:${visitId}:${arrivedAt}`;
}

export async function startVisit(input: StartVisitInput): Promise<{
  locationStatus: "granted" | "denied" | "unavailable";
  syncStatus: "synced" | "pending";
}> {
  const locationResult = await input.locationProvider.getArrivalLocation();
  const location: ArrivalLocation | undefined = locationResult.location;
  const operationId = operationIdFor(input.visitId, input.now);

  const current = input.store.get(input.visitId);
  if (current) {
    input.store.set({
      ...current,
      status: "in_progress",
      arrival: { arrivedAt: input.now, location },
      syncStatus: "pending",
    });
  }

  input.queue.enqueue({
    operationId,
    entityId: input.visitId,
    type: "visit.start",
    payload: {
      operationId,
      arrivedAt: input.now,
      location,
    },
  });

  try {
    await input.api.startVisit(input.visitId, {
      operationId,
      arrivedAt: input.now,
      location,
    });
    input.queue.confirm(operationId);
    if (current) {
      input.store.set({
        ...input.store.get(input.visitId)!,
        syncStatus: "synced",
      });
    }
    return { locationStatus: locationResult.status, syncStatus: "synced" };
  } catch {
    return { locationStatus: locationResult.status, syncStatus: "pending" };
  }
}
