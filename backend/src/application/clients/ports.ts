import type { ClientId, ClientSummary, ClientSystem } from "@qqs/contracts";

import type { ClientRecord } from "../../domain/clients/client.js";

export type { ClientRecord };

export type ClientListFilter = {
  q?: string;
  includeInactive?: boolean;
};

export type ClientRepository = {
  findById(id: ClientId): Promise<ClientSummary | undefined>;
  findByCnpj(cnpj: string): Promise<ClientSummary | undefined>;
  list(filter: ClientListFilter): Promise<ClientSummary[]>;
  save(client: ClientRecord): Promise<void>;
  addSystem(system: ClientSystem): Promise<void>;
};
