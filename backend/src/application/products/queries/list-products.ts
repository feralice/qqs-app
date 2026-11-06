import type { Product } from "@qqs/contracts";

import type { Actor } from "../../../domain/common/actor.js";
import type { ProductRepository } from "../ports.js";

export function listProducts(
  repository: Pick<ProductRepository, "list">,
  actor: Actor,
  filter: { includeInactive?: boolean },
): Promise<Product[]> {
  return repository.list({ includeInactive: actor.role === "supervisor" && Boolean(filter.includeInactive) });
}
