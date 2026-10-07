import { isValidCnpj, normalizeCnpj, type AddClientSystemRequest, type ClientSummary } from "@qqs/contracts";

import { ConflictError, NotFoundError, ValidationError } from "../common/errors.js";

export type ClientRecord = Omit<ClientSummary, "systems">;

export class InvalidClientError extends ValidationError {}

export class ClientNotFoundError extends NotFoundError {
  constructor() {
    super("client not found");
  }
}

export class CnpjAlreadyRegisteredError extends ConflictError {
  constructor() {
    super("cnpj already registered");
  }
}

export class DuplicateSystemError extends ConflictError {
  constructor(name: string) {
    super(`system already registered: ${name}`);
  }
}

function inRange(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

// Invariantes de uma empresa válida (RF-005): devolve o registro normalizado.
export function validateClientRecord(record: ClientRecord): ClientRecord {
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const address = typeof record.address === "string" ? record.address.trim() : "";
  if (!name) throw new InvalidClientError("name is required");
  if (!address) throw new InvalidClientError("address is required");
  if (typeof record.cnpj !== "string" || !isValidCnpj(record.cnpj)) throw new InvalidClientError("invalid cnpj");
  if (!inRange(record.latitude, -90, 90)) throw new InvalidClientError("invalid latitude");
  if (!inRange(record.longitude, -180, 180)) throw new InvalidClientError("invalid longitude");
  if (!Number.isInteger(record.radiusMeters) || record.radiusMeters <= 0) {
    throw new InvalidClientError("radius must be a positive integer in meters");
  }
  return { ...record, name, address, cnpj: normalizeCnpj(record.cnpj) };
}

export function validateClientSystem(input: AddClientSystemRequest): AddClientSystemRequest {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const type = typeof input?.type === "string" ? input.type.trim() : "";
  if (!name || !type) throw new InvalidClientError("system name and type are required");
  return { name, type };
}

// RF-008: cada unidade tem identificador único dentro da empresa.
export function assertUniqueSystemNames(names: string[]): void {
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) throw new DuplicateSystemError(name);
    seen.add(name);
  }
}
