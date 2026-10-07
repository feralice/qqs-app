import type { EmployeeSummary } from "@qqs/contracts";

import type { Column, TabularExporter } from "../../common/tabular-exporter.js";
import type { Visit } from "../../../domain/visits/visit.js";
import { searchVisitHistory, type VisitHistoryFilters, type VisitHistoryRepository } from "./search-visit-history.js";

const statusLabel: Record<Visit["status"], string> = {
  assigned: "Agendada",
  in_progress: "Em andamento",
  completed: "Concluída",
};

// RF-037: mesmo filtro da tela de histórico, exportado para planilha.
export async function exportVisitHistory(
  deps: {
    visits: VisitHistoryRepository;
    employees: { list(): Promise<EmployeeSummary[]> };
    exporter: TabularExporter;
  },
  filters: VisitHistoryFilters,
): Promise<string> {
  const [{ items }, staff] = await Promise.all([searchVisitHistory(deps.visits, filters), deps.employees.list()]);
  const names = new Map(staff.map((employee) => [employee.id, employee.name]));

  const columns: Column<Visit>[] = [
    { header: "Agendada para", value: (visit) => visit.scheduledFor },
    { header: "Empresa", value: (visit) => visit.clientName ?? visit.clientId },
    { header: "Técnico", value: (visit) => names.get(visit.employeeId) ?? visit.employeeId },
    { header: "Status", value: (visit) => statusLabel[visit.status] },
    { header: "Check-in", value: (visit) => visit.arrivedAt },
    { header: "Distância (m)", value: (visit) => visit.arrivalDistanceMeters },
    { header: "Fora do raio", value: (visit) => (visit.arrivedAt ? (visit.outsideRadius ? "Sim" : "Não") : undefined) },
    { header: "Justificativa", value: (visit) => visit.arrivalJustification },
    { header: "Check-out", value: (visit) => visit.leftAt },
    { header: "Duração (min)", value: (visit) => visit.durationMinutes },
    { header: "Descrição", value: (visit) => visit.description },
  ];
  return deps.exporter.export(items, columns);
}
