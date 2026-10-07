import type { OperationId } from "@qqs/contracts";

import type { IdempotencyStore } from "../application/common/idempotency.js";

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly results = new Map<OperationId, unknown>();

  async find<T>(operationId: OperationId): Promise<T | undefined> {
    return this.results.get(operationId) as T | undefined;
  }

  async save<T>(operationId: OperationId, _action: string, result: T): Promise<T> {
    if (!this.results.has(operationId)) this.results.set(operationId, result);
    return this.results.get(operationId) as T;
  }
}
