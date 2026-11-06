import type { ClientId, SystemProgram, UpdateSystemProgramRequest } from "@qqs/contracts";

import { validateSystemProgram } from "../../../domain/products/product.js";
import { requireClient } from "../../clients/commands/require-client.js";
import type { ClientRepository } from "../../clients/ports.js";
import { InactiveProductError, SystemNotInClientError, UnknownProductError } from "../errors.js";
import type { ProductRepository, ProgramRepository } from "../ports.js";

export async function replaceSystemProgram(
  deps: { clients: Pick<ClientRepository, "findById">; products: Pick<ProductRepository, "findById">; programs: ProgramRepository },
  clientId: ClientId,
  systemId: string,
  input: UpdateSystemProgramRequest,
): Promise<SystemProgram> {
  const program = validateSystemProgram(input);
  const client = await requireClient(deps.clients, clientId);
  const system = client.systems.find((candidate) => candidate.id === systemId);
  if (!system) throw new SystemNotInClientError();

  const [current] = await deps.programs.listForSystems([system]);
  const alreadyInProgram = new Set(current.products.map((product) => product.productId));
  for (const { productId } of program.products) {
    const product = await deps.products.findById(productId);
    if (!product) throw new UnknownProductError(productId);
    // Inativar um produto não pode forçar o diretor a removê-lo de programas que já o usam.
    if (!product.active && !alreadyInProgram.has(productId)) throw new InactiveProductError(product.name);
  }

  await deps.programs.replace(systemId, program);
  const [saved] = await deps.programs.listForSystems([system]);
  return saved;
}
