import { asc, eq } from "drizzle-orm";
import type { Product } from "@qqs/contracts";

import type { Database } from "../db/database.js";
import { products } from "../db/schema.js";
import type { ProductRepository } from "../../application/products/ports.js";

type ProductRow = typeof products.$inferSelect;

const nameKey = (name: string) => name.trim().toLowerCase();

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    ...(row.description ? { description: row.description } : {}),
    unit: row.unit,
    active: row.active,
  };
}

export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Product | undefined> {
    const [row] = await this.db.select().from(products).where(eq(products.id, id));
    return row && toProduct(row);
  }

  async findByName(name: string): Promise<Product | undefined> {
    const [row] = await this.db.select().from(products).where(eq(products.nameKey, nameKey(name)));
    return row && toProduct(row);
  }

  async list(filter: { includeInactive: boolean }): Promise<Product[]> {
    const rows = await this.db
      .select()
      .from(products)
      .where(filter.includeInactive ? undefined : eq(products.active, true))
      .orderBy(asc(products.nameKey));
    return rows.map(toProduct);
  }

  async save(product: Product): Promise<void> {
    const fields = {
      name: product.name,
      nameKey: nameKey(product.name),
      description: product.description ?? null,
      unit: product.unit,
      active: product.active,
    };
    await this.db
      .insert(products)
      .values({ id: product.id, ...fields })
      .onConflictDoUpdate({ target: products.id, set: { ...fields, updatedAt: new Date() } });
  }
}
