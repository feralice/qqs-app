import { randomUUID } from "node:crypto";
import type { ClientSummary, CreateClientRequest } from "@qqs/contracts";

import { assertUniqueSystemNames, validateClientRecord, validateClientSystem } from "../../../domain/clients/client.js";
import type { ClientRepository } from "../ports.js";
import { ensureCnpjAvailable, requireClient } from "./require-client.js";

export async function createClient(
  repository: ClientRepository,
  input: CreateClientRequest,
  newId: () => string = randomUUID,
): Promise<ClientSummary> {
  const record = validateClientRecord({
    id: newId(),
    name: input.name,
    cnpj: input.cnpj,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMeters: input.radiusMeters,
    active: true,
  });
  const systems = (input.systems ?? []).map(validateClientSystem);
  assertUniqueSystemNames(systems.map((system) => system.name));
  await ensureCnpjAvailable(repository, record.cnpj, record.id);

  await repository.save(record);
  for (const system of systems) {
    await repository.addSystem({ id: newId(), clientId: record.id, ...system });
  }
  return requireClient(repository, record.id);
}
