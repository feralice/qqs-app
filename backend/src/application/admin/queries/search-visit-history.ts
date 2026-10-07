import type { VisitStatus } from "@qqs/contracts";

import type { Visit } from "../../../domain/visits/visit.js";

export type VisitHistoryRepository = { list(): Promise<Visit[]> };

export type VisitHistoryFilters = {
  from: string;
  to: string;
  employeeId?: string;
  status?: Extract<VisitStatus, "assigned" | "in_progress" | "completed">;
  clientId?: string;
};

export type VisitHistoryPage = { items: Visit[]; total: number };

export async function searchVisitHistory(
  repository: VisitHistoryRepository,
  filters: VisitHistoryFilters,
): Promise<VisitHistoryPage> {
  const from = `${filters.from}T00:00:00.000Z`;
  const to = `${filters.to}T23:59:59.999Z`;
  const items = (await repository.list())
    .filter((visit) => Boolean(visit.scheduledFor && visit.scheduledFor >= from && visit.scheduledFor <= to))
    .filter((visit) => !filters.employeeId || visit.employeeId === filters.employeeId)
    .filter((visit) => !filters.status || visit.status === filters.status)
    .filter((visit) => !filters.clientId || visit.clientId === filters.clientId)
    .sort((a, b) => (b.scheduledFor ?? "").localeCompare(a.scheduledFor ?? ""));

  return { items, total: items.length };
}
