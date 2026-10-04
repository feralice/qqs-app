import type { OperationId, StartVisitRequest } from "@qqs/contracts";

import type { SyncQueue } from "../sync/sync-queue";
import { syncPending, type SyncApi } from "../sync/sync-runner";
import type { ArrivalEvaluation } from "./arrival";
import type { VisitStore } from "./visit-store";

export type StartVisitInput = {
  visitId: string;
  now: string;
  arrival: ArrivalEvaluation;
  justification?: string;
  queue: SyncQueue;
  store: VisitStore;
  api: SyncApi;
};

function operationIdFor(visitId: string, arrivedAt: string): OperationId {
  return `visit-start:${visitId}:${arrivedAt}`;
}

export async function startVisit(input: StartVisitInput): Promise<{ syncStatus: "synced" | "pending" }> {
  const justification = input.justification?.trim() || undefined;
  if (input.arrival.outsideRadius && !justification) {
    throw new Error("justification required");
  }

  const operationId = operationIdFor(input.visitId, input.now);
  const request: StartVisitRequest = {
    operationId,
    arrivedAt: input.now,
    location: input.arrival.location,
    justification,
  };

  const current = input.store.get(input.visitId);
  if (current) {
    await input.store.set({
      ...current,
      status: "in_progress",
      arrival: {
        arrivedAt: input.now,
        location: input.arrival.location,
        distanceMeters: input.arrival.distanceMeters,
        outsideRadius: input.arrival.outsideRadius,
        justification,
      },
      syncStatus: "pending",
    });
  }

  await input.queue.enqueue({ operationId, entityId: input.visitId, type: "visit.start", payload: request });

  // Envia pela fila: uma criação offline ainda pendente precisa chegar antes do check-in.
  await syncPending(input.queue, input.api).catch(() => undefined);
  if (input.queue.get(operationId)?.status !== "synced") {
    return { syncStatus: "pending" };
  }
  const updated = input.store.get(input.visitId);
  if (updated) {
    await input.store.set({ ...updated, syncStatus: "synced" });
  }
  return { syncStatus: "synced" };
}
