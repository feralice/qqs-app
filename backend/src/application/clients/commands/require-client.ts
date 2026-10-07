import type { ClientId, ClientSummary } from "@qqs/contracts";

import { ClientNotFoundError, CnpjAlreadyRegisteredError } from "../../../domain/clients/client.js";
import type { ClientRepository } from "../ports.js";

export async function requireClient(repository: Pick<ClientRepository, "findById">, id: ClientId): Promise<ClientSummary> {
  const client = await repository.findById(id);
  if (!client) throw new ClientNotFoundError();
  return client;
}

export async function ensureCnpjAvailable(repository: ClientRepository, cnpj: string, ownerId: ClientId): Promise<void> {
  const existing = await repository.findByCnpj(cnpj);
  if (existing && existing.id !== ownerId) throw new CnpjAlreadyRegisteredError();
}
