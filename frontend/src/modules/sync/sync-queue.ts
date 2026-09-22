import type { LocalOperation, NewLocalOperation } from "./local-operation";

export type OperationProcessor = (operation: LocalOperation) => Promise<void>;

export class SyncQueue {
  private readonly operations = new Map<string, LocalOperation>();

  private updateStatus(
    operationId: string,
    status: LocalOperation["status"],
  ): LocalOperation {
    const operation = this.require(operationId);
    const updated: LocalOperation = { ...operation, status };
    this.operations.set(operationId, updated);
    return updated;
  }

  private require(operationId: string): LocalOperation {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`operation not found: ${operationId}`);
    }
    return operation;
  }

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
    return this.updateStatus(operationId, "synced");
  }

  get(operationId: string): LocalOperation | undefined {
    return this.operations.get(operationId);
  }

  async process(processor: OperationProcessor): Promise<void> {
    for (const operation of this.pending()) {
      this.updateStatus(operation.operationId, "syncing");

      try {
        await processor(operation);
        this.confirm(operation.operationId);
      } catch {
        this.updateStatus(operation.operationId, "failed");
      }
    }
  }

  pending(): LocalOperation[] {
    return [...this.operations.values()].filter(
      (operation) => operation.status === "pending" || operation.status === "failed",
    );
  }
}
