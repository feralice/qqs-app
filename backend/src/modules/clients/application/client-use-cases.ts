import { randomUUID } from "node:crypto";
import {
  isValidCnpj,
  normalizeCnpj,
  type AddClientSystemRequest,
  type ClientId,
  type ClientSummary,
  type CreateClientRequest,
  type UpdateClientRequest,
} from "@qqs/contracts";

import {
  ClientNotFoundError,
  CnpjAlreadyRegisteredError,
  DuplicateSystemError,
  InvalidClientError,
} from "../domain/client.js";
import type { ClientRecord, ClientRepository } from "./ports.js";

function inRange(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function validateRecord(record: ClientRecord): ClientRecord {
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

function validateSystem(input: AddClientSystemRequest): AddClientSystemRequest {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const type = typeof input?.type === "string" ? input.type.trim() : "";
  if (!name || !type) throw new InvalidClientError("system name and type are required");
  return { name, type };
}

async function requireClient(repository: ClientRepository, id: ClientId): Promise<ClientSummary> {
  const client = await repository.findById(id);
  if (!client) throw new ClientNotFoundError();
  return client;
}

async function ensureCnpjAvailable(repository: ClientRepository, cnpj: string, ownerId: ClientId) {
  const existing = await repository.findByCnpj(cnpj);
  if (existing && existing.id !== ownerId) throw new CnpjAlreadyRegisteredError();
}

export async function createClient(
  repository: ClientRepository,
  input: CreateClientRequest,
  newId: () => string = randomUUID,
): Promise<ClientSummary> {
  const record = validateRecord({
    id: newId(),
    name: input.name,
    cnpj: input.cnpj,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMeters: input.radiusMeters,
    active: true,
  });
  const systems = (input.systems ?? []).map(validateSystem);
  const names = new Set<string>();
  for (const system of systems) {
    if (names.has(system.name)) throw new DuplicateSystemError(system.name);
    names.add(system.name);
  }
  await ensureCnpjAvailable(repository, record.cnpj, record.id);

  await repository.save(record);
  for (const system of systems) {
    await repository.addSystem({ id: newId(), clientId: record.id, ...system });
  }
  return requireClient(repository, record.id);
}

export async function updateClient(
  repository: ClientRepository,
  id: ClientId,
  input: UpdateClientRequest,
): Promise<ClientSummary> {
  const { systems: _systems, ...current } = await requireClient(repository, id);
  const record = validateRecord({ ...current, ...input, id });
  if (input.active !== undefined && typeof input.active !== "boolean") {
    throw new InvalidClientError("active must be a boolean");
  }
  await ensureCnpjAvailable(repository, record.cnpj, id);
  await repository.save(record);
  return requireClient(repository, id);
}

export async function addClientSystem(
  repository: ClientRepository,
  clientId: ClientId,
  input: AddClientSystemRequest,
  newId: () => string = randomUUID,
): Promise<ClientSummary> {
  const system = validateSystem(input);
  const client = await requireClient(repository, clientId);
  if (client.systems.some((existing) => existing.name === system.name)) {
    throw new DuplicateSystemError(system.name);
  }
  await repository.addSystem({ id: newId(), clientId, ...system });
  return requireClient(repository, clientId);
}
