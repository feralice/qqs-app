import type { ClientId, ClientProgram } from "@qqs/contracts";

import { requireClient } from "../../clients/commands/require-client.js";
import type { ClientRepository } from "../../clients/ports.js";
import type { ProgramRepository } from "../ports.js";

export async function getClientProgram(
  deps: { clients: Pick<ClientRepository, "findById">; programs: ProgramRepository },
  clientId: ClientId,
): Promise<ClientProgram> {
  const client = await requireClient(deps.clients, clientId);
  return { clientId, systems: await deps.programs.listForSystems(client.systems) };
}
