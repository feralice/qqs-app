import type { ControlParameter, Product, ProductUnit, ProgramProductInput, UpdateSystemProgramRequest } from "@qqs/contracts";

import { ConflictError, NotFoundError, ValidationError } from "../common/errors.js";

export type ProductInput = Omit<Product, "unit"> & { unit?: ProductUnit };

const UNITS: readonly ProductUnit[] = ["L", "kg"];

export class InvalidProductError extends ValidationError {}

export class InvalidProgramError extends ValidationError {}

export class ProductNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`product not found: ${id}`);
  }
}

export class ProductNameTakenError extends ConflictError {
  constructor() {
    super("product name already registered");
  }
}

export class DuplicateProgramEntryError extends ConflictError {}

function trimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown): string | undefined {
  return trimmed(value) || undefined;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateProduct(input: ProductInput): Product {
  const name = trimmed(input.name);
  const unit = input.unit ?? "L";
  if (!name) throw new InvalidProductError("product name is required");
  if (!UNITS.includes(unit)) throw new InvalidProductError("unit must be L or kg");
  if (typeof input.active !== "boolean") throw new InvalidProductError("active must be a boolean");
  const description = optionalText(input.description);
  return { id: input.id, name, ...(description ? { description } : {}), unit, active: input.active };
}

function validateParameter(input: ControlParameter): ControlParameter {
  const name = trimmed(input?.name);
  if (!name) throw new InvalidProgramError("parameter name is required");
  const { min, max } = input;
  if (min !== undefined && !isFiniteNumber(min)) throw new InvalidProgramError(`invalid min for ${name}`);
  if (max !== undefined && !isFiniteNumber(max)) throw new InvalidProgramError(`invalid max for ${name}`);
  if (min === undefined && max === undefined) throw new InvalidProgramError(`control range required for ${name}`);
  if (min !== undefined && max !== undefined && min > max) throw new InvalidProgramError(`min above max for ${name}`);
  const unit = optionalText(input.unit);
  return { name, ...(unit ? { unit } : {}), ...(min !== undefined ? { min } : {}), ...(max !== undefined ? { max } : {}) };
}

function isPositive(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function validateProgramProduct(input: ProgramProductInput): ProgramProductInput {
  const productId = trimmed(input?.productId);
  if (!productId) throw new InvalidProgramError("productId is required");
  if (!isPositive(input.dailyDose)) throw new InvalidProgramError("dailyDose must be greater than zero");
  if (input.maintenanceDose !== undefined && !isPositive(input.maintenanceDose)) {
    throw new InvalidProgramError("maintenanceDose must be greater than zero");
  }
  return {
    productId,
    dailyDose: input.dailyDose,
    ...(input.maintenanceDose !== undefined ? { maintenanceDose: input.maintenanceDose } : {}),
  };
}

function assertUnique(keys: string[], what: string): void {
  const seen = new Set<string>();
  for (const key of keys) {
    if (seen.has(key)) throw new DuplicateProgramEntryError(`${what} repeated in program: ${key}`);
    seen.add(key);
  }
}

export function validateSystemProgram(input: UpdateSystemProgramRequest): UpdateSystemProgramRequest {
  if (!Array.isArray(input?.parameters) || !Array.isArray(input?.products)) {
    throw new InvalidProgramError("parameters and products are required");
  }
  const parameters = input.parameters.map(validateParameter);
  const products = input.products.map(validateProgramProduct);
  assertUnique(parameters.map((parameter) => parameter.name.toLowerCase()), "parameter");
  assertUnique(products.map((product) => product.productId), "product");
  return { parameters, products };
}
