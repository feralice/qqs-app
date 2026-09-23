import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EmployeeSummary, VisitDetails } from "@qqs/contracts";

import { useOptionalAuth } from "../auth/AuthContext.js";
import { StatCard } from "../../shared/ui/components/StatCard.js";
import { Badge } from "../../shared/ui/components/Badge.js";
import { WeekCalendarStrip } from "../../shared/ui/components/WeekCalendarStrip.js";
import { AdminScheduleModal } from "./AdminScheduleModal.js";
import { theme } from "../../shared/ui/theme.js";
import { styles } from "./AdminHomeScreen.styles.js";

const DEFAULT_VISITS: VisitDetails[] = [
  {
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    clientAddress: "Av. Danilo de Mattos Areosa, 1000",
    scheduledFor: "2026-09-22T09:00:00.000Z",
    status: "in_progress",
    systemsCount: 2,
    systems: [
      { id: "sys-1", name: "Torre 1", type: "tower" },
      { id: "sys-2", name: "Caldeira", type: "boiler" },
    ],
    syncStatus: "synced",
  },
  {
    id: "visit-002",
    clientId: "client-002",
    clientName: "Coca-Cola FEMSA",
    clientAddress: "Av. Tefé, 2500",
    scheduledFor: "2026-09-22T14:00:00.000Z",
    status: "assigned",
    systemsCount: 1,
    systems: [{ id: "sys-3", name: "Chiller Central", type: "chiller" }],
    syncStatus: "synced",
  },
  {
    id: "visit-003",
    clientId: "client-003",
    clientName: "Ambev Manaus",
    clientAddress: "Rua Javari, 800",
    scheduledFor: "2026-09-23T10:00:00.000Z",
    status: "assigned",
    systemsCount: 3,
    systems: [{ id: "sys-4", name: "Osmose Reversa", type: "ro" }],
    syncStatus: "synced",
  },
];

const DEFAULT_EMPLOYEES: EmployeeSummary[] = [
  { id: "employee-001", name: "Carlos Silva", email: "carlos@qqs.com", role: "employee" },
  { id: "emp-2", name: "Marcos Lima", email: "marcos@qqs.com", role: "employee" },
  { id: "emp-3", name: "João Pereira", email: "joao@qqs.com", role: "employee" },
];

const adminModules = [
  {
    title: "Visão Geral das Visitas",
    body: "Acompanhamento em tempo real dos checklists e status das vistorias.",
    iconName: "clipboard" as const,
    badgeLabel: "Ativo",
    badgeVariant: "success" as const,
  },
  {
    title: "Mapa Operacional & GPS",
    body: "Localização precisa dos check-ins e empresas atendidas no dia.",
    iconName: "map" as const,
    badgeLabel: "Ao Vivo",
    badgeVariant: "info" as const,
  },
  {
    title: "Empresas e Funcionários",
    body: "Gerenciamento de clientes, cadastro de técnicos e permissões.",
    iconName: "people" as const,
    badgeLabel: "Gestão",
    badgeVariant: "neutral" as const,
  },
  {
    title: "Auditoria e Relatórios PDF/CSV",
    body: "Exportação de comprovantes de visita e relatórios com assinatura.",
    iconName: "document-text" as const,
    badgeLabel: "Relatórios",
    badgeVariant: "warning" as const,
  },
];

export type AdminHomeScreenProps = {
  userName?: string;
  visits?: VisitDetails[];
  employees?: EmployeeSummary[];
  onScheduleVisit?: (data: {
    clientName: string;
    clientAddress?: string;
    employeeId: string;
    scheduledFor: string;
    systems: Array<{ name: string; type: string }>;
  }) => Promise<void> | void;
  onOpenVisit?: (visitId: string) => void;
  initialDate?: string;
};

export function AdminHomeScreen({
  userName,
  visits = DEFAULT_VISITS,
  employees = DEFAULT_EMPLOYEES,
  onScheduleVisit,
  onOpenVisit,
  initialDate,
}: AdminHomeScreenProps) {
  const auth = useOptionalAuth();
  const displayName = userName ?? auth?.user?.name ?? "Administrador";
  const [allVisits, setAllVisits] = useState<VisitDetails[]>(visits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    if (visits.some((v) => v.scheduledFor?.startsWith(todayStr))) {
      return todayStr;
    }
    const firstScheduled = visits.find((v) => v.scheduledFor)?.scheduledFor;
    return firstScheduled ? firstScheduled.substring(0, 10) : todayStr;
  });

  const visitCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of allVisits) {
      if (v.scheduledFor) {
        const d = v.scheduledFor.substring(0, 10);
        counts[d] = (counts[d] ?? 0) + 1;
      }
    }
    return counts;
  }, [allVisits]);

  const visitsForDay = useMemo(() => {
    return allVisits.filter((v) => v.scheduledFor?.startsWith(selectedDate));
  }, [allVisits, selectedDate]);

  async function handleScheduleVisit(data: {
    clientName: string;
    clientAddress?: string;
    employeeId: string;
    scheduledFor: string;
    systems: Array<{ name: string; type: string }>;
  }) {
    setIsSaving(true);
    try {
      const newVisit: VisitDetails = {
        id: `visit-${Date.now()}`,
        clientId: `client-${Date.now()}`,
        clientName: data.clientName,
        clientAddress: data.clientAddress,
        scheduledFor: data.scheduledFor,
        status: "assigned",
        systemsCount: data.systems.length,
        systems: data.systems.map((s, idx) => ({ id: `sys-${idx}`, name: s.name, type: s.type })),
        syncStatus: "synced",
      };
      setAllVisits((prev) => [newVisit, ...prev]);
      if (onScheduleVisit) {
        await onScheduleVisit(data);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Olá, {displayName}</Text>
          <Text style={styles.subtitle}>Painel de Controle e Gestão Operacional</Text>
        </View>
        <Badge label="Supervisor" variant="info" iconName="shield-checkmark" />
      </View>

      {/* Botão de ação rápida: Agendar Nova Visita */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agendar nova visita"
        onPress={() => setIsModalOpen(true)}
        style={styles.scheduleButton}
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.white} />
        <Text style={styles.scheduleButtonText}>+ Agendar Nova Visita</Text>
      </Pressable>

      {/* Calendário Semanal Interativo */}
      <Text style={styles.sectionTitle}>Agenda Semanal</Text>
      <WeekCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        visitCountsByDate={visitCountsByDate}
      />

      {/* Lista de Visitas do Dia Selecionado */}
      <View style={styles.agendaSectionHeader}>
        <Text style={styles.agendaSectionTitle}>
          Visitas em {selectedDate.split("-").reverse().join("/")}
        </Text>
        <Text style={styles.agendaSectionCount}>{visitsForDay.length} agendadas</Text>
      </View>

      {visitsForDay.length === 0 ? (
        <View style={styles.emptyDayBox}>
          <Text style={styles.emptyDayText}>Nenhum atendimento agendado para esta data.</Text>
        </View>
      ) : (
        visitsForDay.map((v) => (
          <Pressable
            key={v.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir visita de ${v.clientName}`}
            onPress={() => onOpenVisit?.(v.id)}
            style={styles.adminVisitCard}
          >
            <View style={styles.adminVisitHeader}>
              <Text style={styles.adminClientName}>{v.clientName}</Text>
              <Badge
                label={
                  v.status === "completed"
                    ? "Concluído"
                    : v.status === "in_progress"
                      ? "Em andamento"
                      : "Aguardando"
                }
                variant={
                  v.status === "completed"
                    ? "success"
                    : v.status === "in_progress"
                      ? "info"
                      : "neutral"
                }
              />
            </View>
            {v.clientAddress && (
              <Text style={styles.adminClientAddress} numberOfLines={1}>
                {v.clientAddress}
              </Text>
            )}
            <View style={styles.adminVisitFooter}>
              <Text style={styles.adminSystemsCount}>
                {v.systemsCount} {v.systemsCount === 1 ? "sistema" : "sistemas"}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </View>
          </Pressable>
        ))
      )}

      {/* KPI Stats Grid */}
      <Text style={styles.sectionTitle}>Métricas da Operação</Text>
      <View style={styles.statsRow}>
        <StatCard
          title="Visitas Hoje"
          value={String(allVisits.length)}
          subtitle="Total no período"
          iconName="calendar"
          accentColor={theme.colors.corporateBlue}
          trend="+15%"
        />
        <StatCard
          title="Técnicos Ativos"
          value={String(employees.length)}
          subtitle="Equipe cadastrada"
          iconName="people"
          accentColor="#27AE60"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          title="Tempo Médio"
          value="45 min"
          subtitle="Por atendimento"
          iconName="stopwatch"
          accentColor="#F39C12"
        />
        <StatCard
          title="Precisão GPS"
          value="100%"
          subtitle="Sem divergência"
          iconName="navigate"
          accentColor={theme.colors.corporateBlue}
        />
      </View>

      {/* Admin Modules */}
      <Text style={styles.sectionTitle}>Módulos do Sistema</Text>
      {adminModules.map((item) => (
        <View key={item.title} style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIconWrap}>
              <Ionicons name={item.iconName} size={20} color={theme.colors.corporateBlue} />
            </View>
            <View style={styles.moduleTextWrap}>
              <Text style={styles.moduleTitle}>{item.title}</Text>
              <Text style={styles.moduleBody}>{item.body}</Text>
            </View>
          </View>
          <View style={styles.moduleFooter}>
            <Badge label={item.badgeLabel} variant={item.badgeVariant} showDot />
            <Ionicons name="chevron-forward" size={18} color="#8A8F98" />
          </View>
        </View>
      ))}

      {/* Modal de Agendamento */}
      <AdminScheduleModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleScheduleVisit}
        employees={employees}
        loading={isSaving}
      />
    </ScrollView>
  );
}
