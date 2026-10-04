import type { CreateVisitRequest, FinishVisitRequest, StartVisitRequest } from "@qqs/contracts";

import type { VisitApi } from "../visits/visit-api";
import type { OperationProcessor, SyncQueue } from "./sync-queue";

export type SyncApi = {
  createVisit(request: CreateVisitRequest): Promise<unknown>;
  startVisit: VisitApi["startVisit"];
  finishVisit: VisitApi["finishVisit"];
};

export function createVisitOperationProcessor(api: SyncApi): OperationProcessor {
  return async (operation) => {
    switch (operation.type) {
      case "visit.create":
        await api.createVisit(operation.payload as CreateVisitRequest);
        return;
      case "visit.start":
        await api.startVisit(operation.entityId, operation.payload as StartVisitRequest);
        return;
      case "visit.finish":
        await api.finishVisit(operation.entityId, operation.payload as FinishVisitRequest);
        return;
      default:
        throw new Error(`unknown operation type: ${operation.type}`);
    }
  };
}

export async function syncPending(queue: SyncQueue, api: SyncApi): Promise<{ remaining: number }> {
  await queue.process(createVisitOperationProcessor(api));
  return { remaining: queue.pending().length };
}
