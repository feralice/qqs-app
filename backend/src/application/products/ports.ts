import type { ClientSystem, Product, ProductId, SystemProgram, UpdateSystemProgramRequest } from "@qqs/contracts";

export type ProductRepository = {
  findById(id: ProductId): Promise<Product | undefined>;
  findByName(name: string): Promise<Product | undefined>;
  list(filter: { includeInactive: boolean }): Promise<Product[]>;
  save(product: Product): Promise<void>;
};

export type ProgramRepository = {
  // Devolve um programa por sistema, na ordem recebida; sistema sem programa vem com listas vazias.
  listForSystems(systems: ClientSystem[]): Promise<SystemProgram[]>;
  replace(systemId: string, program: UpdateSystemProgramRequest): Promise<void>;
};
