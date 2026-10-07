import type { OperationId } from "@qqs/contracts";

// RF-044: o aparelho reenvia a mesma operação até receber resposta; o resultado
// da primeira execução é devolvido nas seguintes, sem aplicar de novo.
export type IdempotencyStore = {
  find<T>(operationId: OperationId): Promise<T | undefined>;
  save<T>(operationId: OperationId, action: string, result: T): Promise<T>;
};

export async function runOnce<T>(
  store: IdempotencyStore,
  operationId: OperationId,
  action: string,
  execute: () => Promise<T>,
): Promise<T> {
  const previous = await store.find<T>(operationId);
  if (previous !== undefined) return previous;
  return store.save(operationId, action, await execute());
}
