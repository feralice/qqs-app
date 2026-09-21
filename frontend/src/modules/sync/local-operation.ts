import type { OperationId, SyncStatus } from "@qqs/contracts";

export type LocalOperation = {
  operationId: OperationId;
  entityId: string;
  type: string;
  payload: Record<string, unknown>;
  status: SyncStatus;
};

export type NewLocalOperation = Omit<LocalOperation, "status">;
