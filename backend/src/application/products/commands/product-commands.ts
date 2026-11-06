import { randomUUID } from "node:crypto";
import type { CreateProductRequest, Product, ProductId, UpdateProductRequest } from "@qqs/contracts";

import { ProductNameTakenError, ProductNotFoundError, validateProduct } from "../../../domain/products/product.js";
import type { ProductRepository } from "../ports.js";

export async function requireProduct(repository: Pick<ProductRepository, "findById">, id: ProductId): Promise<Product> {
  const product = await repository.findById(id);
  if (!product) throw new ProductNotFoundError(id);
  return product;
}

async function ensureNameAvailable(repository: ProductRepository, product: Product): Promise<void> {
  const existing = await repository.findByName(product.name);
  if (existing && existing.id !== product.id) throw new ProductNameTakenError();
}

export async function createProduct(
  repository: ProductRepository,
  input: CreateProductRequest,
  newId: () => string = randomUUID,
): Promise<Product> {
  const product = validateProduct({ ...input, id: newId(), active: true });
  await ensureNameAvailable(repository, product);
  await repository.save(product);
  return product;
}

export async function updateProduct(
  repository: ProductRepository,
  id: ProductId,
  input: UpdateProductRequest,
): Promise<Product> {
  const product = validateProduct({ ...(await requireProduct(repository, id)), ...input, id });
  await ensureNameAvailable(repository, product);
  await repository.save(product);
  return product;
}
