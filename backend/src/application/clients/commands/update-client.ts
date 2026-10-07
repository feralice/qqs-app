import type { ClientId, ClientSummary, UpdateClientRequest } from "@qqs/contracts";

import { InvalidClientError, validateClientRecord } from "../../../domain/clients/client.js";
import type { ClientRepository } from "../ports.js";
import { ensureCnpjAvailable, requireClient } from "./require-client.js";

export async function updateClient(
  repository: ClientRepository,
  id: ClientId,
  input: UpdateClientRequest,
): Promise<ClientSummary> {
  const { systems: _systems, ...current } = await requireClient(repository, id);
  const record = validateClientRecord({ ...current, ...input, id });
  if (input.active !== undefined && typeof input.active !== "boolean") {
    throw new InvalidClientError("active must be a boolean");
  }
  await ensureCnpjAvailable(repository, record.cnpj, id);
  await repository.save(record);
  return requireClient(repository, id);
}
