import { z } from "zod";
import type { CreateVisitRequest, VisitDetails, VisitPhoto } from "@qqs/contracts";

import { ArrivalLocationSchema, EmployeeSummarySchema, isoDateTime, operationId } from "../../http/schemas.js";

const VisitPhotoSchema = z
  .object({
    id: z.string(),
    uri: z.string(),
    caption: z.string().optional(),
    takenAt: z.string(),
  })
  .meta({ id: "VisitPhoto" }) satisfies z.ZodType<VisitPhoto>;

const visitStatus = z.enum(["assigned", "draft", "in_progress", "completed", "synced", "pending_sync", "sync_failed"]);

export const VisitDetailsSchema = z
  .object({
    id: z.string(),
    clientId: z.string(),
    employeeId: z.string().optional(),
    clientName: z.string(),
    scheduledFor: z.string(),
    status: visitStatus,
    systemsCount: z.number().int(),
    clientAddress: z.string().optional(),
    clientLocation: z
      .object({ latitude: z.number(), longitude: z.number(), radiusMeters: z.number().int() })
      .optional(),
    systems: z.array(z.object({ id: z.string(), name: z.string(), type: z.string() })),
    arrival: z
      .object({
        arrivedAt: z.string(),
        location: ArrivalLocationSchema.optional(),
        distanceMeters: z.number().optional(),
        outsideRadius: z.boolean().optional(),
        justification: z.string().optional(),
      })
      .optional(),
    departure: z.object({ leftAt: z.string(), location: ArrivalLocationSchema.optional() }).optional(),
    durationMinutes: z.number().int().optional(),
    description: z.string().optional(),
    attendants: z.array(EmployeeSummarySchema).optional(),
    photos: z.array(VisitPhotoSchema).optional(),
    finishedAt: z.string().optional(),
    syncStatus: z.enum(["pending", "syncing", "synced", "failed"]),
  })
  .meta({ id: "VisitDetails" }) satisfies z.ZodType<VisitDetails>;

export const VisitListSchema = z.object({ items: z.array(VisitDetailsSchema) });
export const EmployeeListSchema = z.object({ items: z.array(EmployeeSummarySchema) });

export const CreateVisitBody = z.object({
  id: z.string().min(1).optional().describe("UUID gerado no aparelho; reenviar o mesmo id não duplica."),
  clientId: z.string().min(1),
  employeeId: z.string().min(1).optional().describe("Só vale para supervisor; técnico agenda para si."),
  scheduledFor: isoDateTime.optional(),
}) satisfies z.ZodType<Partial<CreateVisitRequest>>;

export const StartVisitBody = z.object({
  operationId,
  arrivedAt: isoDateTime,
  location: ArrivalLocationSchema.optional().describe("Ausente quando o GPS não respondeu; conta como fora do raio."),
  justification: z.string().optional().describe("Obrigatória quando o check-in fica fora do raio (RF-016)."),
});

export const FinishVisitBody = z.object({
  operationId: operationId.optional(),
  finishedAt: isoDateTime.optional(),
  location: ArrivalLocationSchema.optional(),
  description: z.string().optional(),
  attendants: z.array(EmployeeSummarySchema).optional(),
  photos: z.array(VisitPhotoSchema).optional(),
});
