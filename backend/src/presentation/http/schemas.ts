import { z } from "zod";
import type { ArrivalLocation, EmployeeSummary } from "@qqs/contracts";

export const ErrorSchema = z
  .object({
    error: z.string(),
    details: z.unknown().optional(),
  })
  .meta({ id: "Error", description: "Resposta de erro padrão da API." });

export const isoDateTime = z.iso.datetime({ offset: true });
export const isoDate = z.iso.date();
export const operationId = z.string().min(1).describe("Chave de idempotência gerada no aparelho.");

export const ArrivalLocationSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
  })
  .meta({ id: "ArrivalLocation" }) satisfies z.ZodType<ArrivalLocation>;

export const EmployeeSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["employee", "supervisor"]),
  })
  .meta({ id: "EmployeeSummary" }) satisfies z.ZodType<EmployeeSummary>;

export const errorResponses = {
  validation: { description: "Entrada inválida.", schema: ErrorSchema },
  unauthorized: { description: "Token ausente, inválido ou expirado.", schema: ErrorSchema },
  forbidden: { description: "Perfil sem permissão.", schema: ErrorSchema },
  notFound: { description: "Recurso não encontrado.", schema: ErrorSchema },
  conflict: { description: "Conflito com o estado atual.", schema: ErrorSchema },
} as const;
