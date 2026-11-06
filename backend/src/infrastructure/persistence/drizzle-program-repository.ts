import { asc, eq, inArray } from "drizzle-orm";
import type { ClientSystem, ControlParameter, ProgramProduct, SystemProgram, UpdateSystemProgramRequest } from "@qqs/contracts";

import type { Database } from "../db/database.js";
import { products, systemParameters, systemProducts } from "../db/schema.js";
import type { ProgramRepository } from "../../application/products/ports.js";

export class DrizzleProgramRepository implements ProgramRepository {
  constructor(private readonly db: Database) {}

  async listForSystems(systems: ClientSystem[]): Promise<SystemProgram[]> {
    if (systems.length === 0) return [];
    const ids = systems.map((system) => system.id);
    const [parameterRows, productRows] = await Promise.all([
      this.db
        .select()
        .from(systemParameters)
        .where(inArray(systemParameters.systemId, ids))
        .orderBy(asc(systemParameters.position)),
      this.db
        .select({ entry: systemProducts, product: products })
        .from(systemProducts)
        .innerJoin(products, eq(products.id, systemProducts.productId))
        .where(inArray(systemProducts.systemId, ids))
        .orderBy(asc(systemProducts.position)),
    ]);

    return systems.map((system) => ({
      systemId: system.id,
      systemName: system.name,
      systemType: system.type,
      parameters: parameterRows
        .filter((row) => row.systemId === system.id)
        .map(
          (row): ControlParameter => ({
            name: row.name,
            ...(row.unit ? { unit: row.unit } : {}),
            ...(row.min !== null ? { min: row.min } : {}),
            ...(row.max !== null ? { max: row.max } : {}),
          }),
        ),
      products: productRows
        .filter((row) => row.entry.systemId === system.id)
        .map(
          ({ entry, product }): ProgramProduct => ({
            productId: product.id,
            productName: product.name,
            unit: product.unit,
            productActive: product.active,
            dailyDose: entry.dailyDose,
            ...(entry.maintenanceDose !== null ? { maintenanceDose: entry.maintenanceDose } : {}),
          }),
        ),
    }));
  }

  async replace(systemId: string, program: UpdateSystemProgramRequest): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(systemParameters).where(eq(systemParameters.systemId, systemId));
      await tx.delete(systemProducts).where(eq(systemProducts.systemId, systemId));
      if (program.parameters.length > 0) {
        await tx.insert(systemParameters).values(
          program.parameters.map((parameter, position) => ({
            systemId,
            position,
            name: parameter.name,
            unit: parameter.unit ?? null,
            min: parameter.min ?? null,
            max: parameter.max ?? null,
          })),
        );
      }
      if (program.products.length > 0) {
        await tx.insert(systemProducts).values(
          program.products.map((product, position) => ({
            systemId,
            position,
            productId: product.productId,
            dailyDose: product.dailyDose,
            maintenanceDose: product.maintenanceDose ?? null,
          })),
        );
      }
    });
  }
}
