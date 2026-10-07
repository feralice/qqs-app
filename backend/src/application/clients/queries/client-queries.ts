import type { ClientId, ClientSummary } from "@qqs/contracts";

import type { Actor } from "../../../domain/common/actor.js";
import { requireClient } from "../commands/require-client.js";
import type { ClientRepository } from "../ports.js";

// Empresa inativa só aparece para supervisor, e só quando ele pede.
export function listClients(
  repository: Pick<ClientRepository, "list">,
  actor: Actor,
  filter: { q?: string; includeInactive?: boolean },
): Promise<ClientSummary[]> {
  return repository.list({ q: filter.q, includeInactive: actor.role === "supervisor" && Boolean(filter.includeInactive) });
}

export function getClient(repository: Pick<ClientRepository, "findById">, id: ClientId): Promise<ClientSummary> {
  return requireClient(repository, id);
}
