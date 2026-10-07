import { randomUUID } from "node:crypto";
import type { AddClientSystemRequest, ClientId, ClientSummary } from "@qqs/contracts";

import { assertUniqueSystemNames, validateClientSystem } from "../../../domain/clients/client.js";
import type { ClientRepository } from "../ports.js";
import { requireClient } from "./require-client.js";

export async function addClientSystem(
  repository: ClientRepository,
  clientId: ClientId,
  input: AddClientSystemRequest,
  newId: () => string = randomUUID,
): Promise<ClientSummary> {
  const system = validateClientSystem(input);
  const client = await requireClient(repository, clientId);
  assertUniqueSystemNames([...client.systems.map((existing) => existing.name), system.name]);
  await repository.addSystem({ id: newId(), clientId, ...system });
  return requireClient(repository, clientId);
}
