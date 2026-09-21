import type { LocalOperation, NewLocalOperation } from "./local-operation.js";

export class SyncQueue {
  private readonly operations = new Map<string, LocalOperation>();

  enqueue(input: NewLocalOperation): LocalOperation {
    const existing = this.operations.get(input.operationId);
    if (existing) {
      return existing;
    }

    const operation: LocalOperation = { ...input, status: "pending" };
    this.operations.set(operation.operationId, operation);
    return operation;
  }

  confirm(operationId: string): LocalOperation {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error("operation not found");
    }

    const confirmed: LocalOperation = { ...operation, status: "synced" };
    this.operations.set(operationId, confirmed);
    return confirmed;
  }

  pending(): LocalOperation[] {
    return [...this.operations.values()].filter(
      (operation) => operation.status === "pending" || operation.status === "failed",
    );
  }
}
