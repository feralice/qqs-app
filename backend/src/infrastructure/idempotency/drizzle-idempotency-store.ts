import { eq } from "drizzle-orm";
import type { OperationId } from "@qqs/contracts";

import type { Database } from "../db/database.js";
import { processedOperations } from "../db/schema.js";
import type { IdempotencyStore } from "../../application/common/idempotency.js";

export class DrizzleIdempotencyStore implements IdempotencyStore {
  constructor(private readonly db: Database) {}

  async find<T>(operationId: OperationId): Promise<T | undefined> {
    const [row] = await this.db
      .select({ result: processedOperations.result })
      .from(processedOperations)
      .where(eq(processedOperations.operationId, operationId));
    return row?.result as T | undefined;
  }

  // Duas requisições simultâneas com o mesmo id: a segunda não sobrescreve e
  // devolve o que a primeira gravou.
  async save<T>(operationId: OperationId, action: string, result: T): Promise<T> {
    await this.db.insert(processedOperations).values({ operationId, action, result }).onConflictDoNothing();
    return (await this.find<T>(operationId)) as T;
  }
}
