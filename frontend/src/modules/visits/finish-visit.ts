import type {
  ArrivalLocation,
  EmployeeSummary,
  OperationId,
  VisitDetails,
  VisitPhoto,
} from "@qqs/contracts";

import type { LocationProvider } from "../location/location-provider.js";
import type { SyncQueue } from "../sync/sync-queue.js";
import type { VisitApi } from "./visit-api.js";
import { VisitStore } from "./visit-store.js";

export type FinishVisitInput = {
  visitId: string;
  clientId: string;
  employeeId: string;
  now: string;
  locationProvider: LocationProvider;
  queue: SyncQueue;
  store: VisitStore;
  api: Pick<VisitApi, "finishVisit">;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
};

function operationIdFor(visitId: string, finishedAt: string): OperationId {
  return `visit-finish:${visitId}:${finishedAt}`;
}

export async function finishVisit(input: FinishVisitInput): Promise<{
  locationStatus: "granted" | "denied" | "unavailable";
  syncStatus: "synced" | "pending";
  visit: VisitDetails;
}> {
  const locationResult = await input.locationProvider.getArrivalLocation();
  const location: ArrivalLocation | undefined = locationResult.location;
  const operationId = operationIdFor(input.visitId, input.now);

  const current = input.store.get(input.visitId);
  const arrivedAt = current?.arrival?.arrivedAt;
  const durationMinutes = arrivedAt
    ? Math.max(
        0,
        Math.round((new Date(input.now).getTime() - new Date(arrivedAt).getTime()) / (1000 * 60)),
      )
    : current?.durationMinutes ?? 0;

  const localUpdated: VisitDetails = {
    ...(current ?? {
      id: input.visitId,
      clientId: input.clientId,
      clientName: input.clientId,
      scheduledFor: input.now,
      systemsCount: 0,
      systems: [],
      syncStatus: "pending",
    }),
    status: "completed",
    finishedAt: input.now,
    departure: { leftAt: input.now, location },
    durationMinutes,
    description: input.description ?? current?.description,
    attendants: input.attendants ?? current?.attendants,
    photos: input.photos ?? current?.photos,
    syncStatus: "pending",
  };

  input.store.set(localUpdated);

  input.queue.enqueue({
    operationId,
    entityId: input.visitId,
    type: "visit.finish",
    payload: {
      operationId,
      finishedAt: input.now,
      location,
      description: input.description,
      attendants: input.attendants,
      photos: input.photos,
    },
  });

  try {
    const remote = await input.api.finishVisit(input.visitId, {
      operationId,
      finishedAt: input.now,
      location,
      description: input.description,
      attendants: input.attendants,
      attendantIds: input.attendants?.map((a) => a.id),
      photos: input.photos,
    });
    input.queue.confirm(operationId);
    const syncedVisit: VisitDetails = {
      ...localUpdated,
      ...remote,
      status: "completed",
      syncStatus: "synced",
    };
    input.store.set(syncedVisit);
    return {
      locationStatus: locationResult.status,
      syncStatus: "synced",
      visit: syncedVisit,
    };
  } catch {
    return {
      locationStatus: locationResult.status,
      syncStatus: "pending",
      visit: localUpdated,
    };
  }
}
