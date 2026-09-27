import type {
  AdminDashboardSummary,
  EmployeeSummary,
} from "@qqs/contracts";

import type { Visit } from "../../visits/domain/visit.js";

export type DashboardVisitRepository = {
  list(): Promise<Visit[]>;
};

export type DashboardEmployeeRepository = {
  list(): Promise<EmployeeSummary[]>;
};

export type GetAdminDashboardOptions = {
  date: string;
  now?: string;
};

function sameDate(value: string | undefined, date: string): boolean {
  return value?.startsWith(date) ?? false;
}

export async function getAdminDashboard(
  visitsRepository: DashboardVisitRepository,
  options: GetAdminDashboardOptions,
  employeesRepository?: DashboardEmployeeRepository,
): Promise<AdminDashboardSummary> {
  const visits = (await visitsRepository.list()).filter((visit) =>
    sameDate(visit.scheduledFor, options.date),
  );
  const now = options.now ?? new Date().toISOString();
  const overdueVisits = visits.filter(
    (visit) =>
      visit.status !== "completed" &&
      Boolean(visit.scheduledFor && visit.scheduledFor < now),
  );

  const activeByEmployee = new Map<string, number>();
  for (const visit of visits) {
    if (visit.status === "in_progress") {
      activeByEmployee.set(
        visit.employeeId,
        (activeByEmployee.get(visit.employeeId) ?? 0) + 1,
      );
    }
  }

  const employees = employeesRepository
    ? (await employeesRepository.list()).map((employee) => ({
        ...employee,
        activeVisits: activeByEmployee.get(employee.id) ?? 0,
        status: activeByEmployee.has(employee.id) ? ("busy" as const) : ("available" as const),
      }))
    : [];

  return {
    date: options.date,
    counts: {
      scheduled: visits.filter((visit) => visit.status === "assigned").length,
      inProgress: visits.filter((visit) => visit.status === "in_progress").length,
      completed: visits.filter((visit) => visit.status === "completed").length,
      overdue: overdueVisits.length,
    },
    alerts: overdueVisits.map((visit) => ({
      id: `overdue:${visit.id}:${options.date}`,
      visitId: visit.id,
      type: "overdue" as const,
      message: `Visita atrasada${visit.clientName ? `: ${visit.clientName}` : ""}`,
      createdAt: now,
    })),
    employees,
    lastUpdatedAt: now,
    isLoaded: true,
  };
}
