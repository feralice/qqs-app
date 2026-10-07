import { z } from "zod";
import type { AddClientSystemRequest, ClientSummary, CreateClientRequest, UpdateClientRequest } from "@qqs/contracts";

// Só formato aqui. Regras de negócio (dígito do CNPJ, faixa de coordenadas, raio
// positivo) ficam no caso de uso, para não existirem em dois lugares.
export const ClientSystemBody = z.object({
  name: z.string().describe('Identificador da unidade, ex.: "Torre 1".'),
  type: z.string().describe('Tipo do sistema, ex.: "torre", "caldeira".'),
}) satisfies z.ZodType<AddClientSystemRequest>;

export const CreateClientBody = z.object({
  name: z.string().describe("Razão social."),
  cnpj: z.string().describe("CNPJ com ou sem máscara; aceita o formato alfanumérico."),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  radiusMeters: z.number().describe("Raio permitido para o check-in, em metros."),
  systems: z.array(ClientSystemBody).optional(),
}) satisfies z.ZodType<CreateClientRequest>;

export const UpdateClientBody = CreateClientBody.omit({ systems: true })
  .partial()
  .extend({ active: z.boolean().optional() }) satisfies z.ZodType<UpdateClientRequest>;

export const ListClientsQuery = z.object({
  q: z.string().optional().describe("Busca por nome ou parte do CNPJ."),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
    .describe("Só tem efeito para supervisor."),
});

export const ClientSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    cnpj: z.string(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    radiusMeters: z.number().int(),
    active: z.boolean(),
    systems: z.array(z.object({ id: z.string(), clientId: z.string(), name: z.string(), type: z.string() })),
  })
  .meta({ id: "ClientSummary" }) satisfies z.ZodType<ClientSummary>;

export const ClientListSchema = z.object({ items: z.array(ClientSummarySchema) });
