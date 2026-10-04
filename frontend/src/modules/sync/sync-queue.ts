import { isPermanentRejection } from "../../shared/http/api-error";
import type { KeyValueStorage } from "./key-value-storage";
import type { LocalOperation, NewLocalOperation } from "./local-operation";

export type OperationProcessor = (operation: LocalOperation) => Promise<void>;

export class SyncQueue {
  private readonly operations = new Map<string, LocalOperation>();
  private running?: Promise<void>;

  constructor(
    private readonly storage?: KeyValueStorage,
    private readonly storageKey = "sync-queue",
  ) {}

  // Uma operação gravada como "syncing" significa que o app morreu no meio do envio.
  static async open(storage: KeyValueStorage, storageKey = "sync-queue"): Promise<SyncQueue> {
    const queue = new SyncQueue(storage, storageKey);
    const raw = await storage.getItem(storageKey);
    const saved: LocalOperation[] = raw ? JSON.parse(raw) : [];
    for (const operation of saved) {
      queue.operations.set(operation.operationId, {
        ...operation,
        status: operation.status === "syncing" ? "failed" : operation.status,
      });
    }
    return queue;
  }

  private async persist(): Promise<void> {
    if (!this.storage) return;
    const unsynced = [...this.operations.values()].filter((operation) => operation.status !== "synced");
    await this.storage.setItem(this.storageKey, JSON.stringify(unsynced));
  }

  private async updateStatus(operationId: string, status: LocalOperation["status"]): Promise<LocalOperation> {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`operation not found: ${operationId}`);
    }
    const updated: LocalOperation = { ...operation, status };
    this.operations.set(operationId, updated);
    await this.persist();
    return updated;
  }

  async enqueue(input: NewLocalOperation): Promise<LocalOperation> {
    const existing = this.operations.get(input.operationId);
    if (existing) {
      return existing;
    }
    const operation: LocalOperation = { ...input, status: "pending" };
    this.operations.set(operation.operationId, operation);
    await this.persist();
    return operation;
  }

  confirm(operationId: string): Promise<LocalOperation> {
    return this.updateStatus(operationId, "synced");
  }

  get(operationId: string): LocalOperation | undefined {
    return this.operations.get(operationId);
  }

  // Um envio por vez; chamadas concorrentes esperam o envio em andamento.
  process(processor: OperationProcessor): Promise<void> {
    this.running ??= this.run(processor).finally(() => {
      this.running = undefined;
    });
    return this.running;
  }

  // Falha de rede para tudo (a ordem importa: check-out depois do check-in).
  // Recusa definitiva do servidor separa a operação e bloqueia só a mesma visita.
  private async run(processor: OperationProcessor): Promise<void> {
    const blocked = new Set(this.rejected().map((operation) => operation.entityId));
    for (const operation of this.pending()) {
      if (blocked.has(operation.entityId)) continue;
      await this.updateStatus(operation.operationId, "syncing");
      try {
        await processor(operation);
        await this.confirm(operation.operationId);
      } catch (error) {
        if (isPermanentRejection(error)) {
          await this.updateStatus(operation.operationId, "rejected");
          blocked.add(operation.entityId);
          continue;
        }
        await this.updateStatus(operation.operationId, "failed");
        return;
      }
    }
  }

  rejected(): LocalOperation[] {
    return [...this.operations.values()].filter((operation) => operation.status === "rejected");
  }

  pending(): LocalOperation[] {
    return [...this.operations.values()].filter(
      (operation) => operation.status === "pending" || operation.status === "failed",
    );
  }
}
