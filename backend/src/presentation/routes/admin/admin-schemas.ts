import { z } from "zod";
import type { AdminDashboardSummary } from "@qqs/contracts";

import { EmployeeSummarySchema, isoDate, isoDateTime, operationId } from "../../http/schemas.js";
import { VisitDetailsSchema } from "../visits/visit-schemas.js";

export const DashboardQuery = z.object({
  date: isoDate.optional().describe("Dia (AAAA-MM-DD). Padrão: hoje em UTC."),
});

export const HistoryQuery = z
  .object({
    from: isoDate.optional().describe("Início do período. Padrão: hoje."),
    to: isoDate.optional().describe("Fim do período. Padrão: igual a `from`."),
    employeeId: z.string().optional(),
    clientId: z.string().optional(),
    status: z.enum(["assigned", "in_progress", "completed"]).optional(),
  });

export const RescheduleBody = z.object({ scheduledFor: isoDateTime, operationId });
export const ReassignBody = z.object({ employeeId: z.string().min(1), operationId });
export const ResolveAlertBody = z.object({ operationId });

export const DashboardSchema = z
  .object({
    date: z.string(),
    counts: z.object({
      scheduled: z.number().int(),
      inProgress: z.number().int(),
      completed: z.number().int(),
      overdue: z.number().int(),
    }),
    alerts: z.array(
      z.object({
        id: z.string(),
        visitId: z.string(),
        type: z.enum(["overdue", "problem", "outside_radius"]),
        message: z.string(),
        createdAt: z.string(),
      }),
    ),
    employees: z.array(
      EmployeeSummarySchema.extend({
        status: z.enum(["available", "busy", "offline"]),
        activeVisits: z.number().int(),
      }),
    ),
    lastUpdatedAt: z.string(),
    isLoaded: z.boolean(),
  })
  .meta({ id: "AdminDashboard" }) satisfies z.ZodType<AdminDashboardSummary>;

export const HistorySchema = z.object({ items: z.array(VisitDetailsSchema), total: z.number().int() });
export const ResolvedAlertSchema = z.object({ alertId: z.string(), resolved: z.literal(true) });
