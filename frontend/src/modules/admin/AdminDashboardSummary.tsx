import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AdminAlertSummary, AdminDashboardSummary as DashboardSummary, EmployeeOperationalStatus } from "@qqs/contracts";

import { theme } from "../../shared/ui/theme";
import { Badge } from "../../shared/ui/components/Badge";
import { StatCard } from "../../shared/ui/components/StatCard";
import { Grid } from "../../shared/ui/layout";
import { styles } from "./AdminDashboardSummary.styles";

export type AdminDashboardSummaryProps = {
  summary?: DashboardSummary;
  isLoading?: boolean;
  isStale?: boolean;
  onAlertPress?: (visitId: string) => void;
  onOpenVisit?: (visitId: string) => void;
};

export function AdminDashboardSummary({
  summary,
  isLoading = false,
  isStale = false,
  onAlertPress,
  onOpenVisit,
}: AdminDashboardSummaryProps) {
  const [expandedStaff, setExpandedStaff] = useState(false);
  const handleAlert = onAlertPress ?? onOpenVisit;

  const sortedEmployees = useMemo(() => {
    if (!summary?.employees) return [];
    const order: Record<EmployeeOperationalStatus["status"], number> = {
      busy: 1,
      available: 2,
      offline: 3,
    };
    return [...summary.employees].sort((a, b) => {
      const orderDiff = order[a.status] - order[b.status];
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
  }, [summary?.employees]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Resumo do dia</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Carregando resumo...</Text>
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Resumo do dia</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Resumo indisponível</Text>
        </View>
      </View>
    );
  }

  const { counts, alerts, lastUpdatedAt, employees } = summary;
  const hasVisits = counts.scheduled > 0 || counts.inProgress > 0 || counts.completed > 0 || counts.overdue > 0;
  const updatedTime = new Date(lastUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const visibleEmployees = expandedStaff ? sortedEmployees : sortedEmployees.slice(0, 5);
  const hasMoreEmployees = sortedEmployees.length > 5 && !expandedStaff;

  return (
    <View style={styles.container} accessibilityLabel="Resumo do dia">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Resumo do dia</Text>
        {isStale ? (
          <Badge
            label={`Atualizado às ${updatedTime} (offline)`}
            variant="warning"
            iconName="cloud-offline"
          />
        ) : (
          <View style={styles.updatedRow}>
            <Text style={styles.updatedText}>Atualizado às {updatedTime}</Text>
          </View>
        )}
      </View>

      {hasVisits ? (
        <Grid columns={2} gap={theme.spacing.md}>
          <StatCard
            title="Agendadas"
            value={counts.scheduled}
            iconName="calendar"
            accentColor={theme.colors.corporateBlue}
          />
          <StatCard
            title="Em andamento"
            value={counts.inProgress}
            iconName="play-circle"
            accentColor={theme.colors.aqua}
          />
          <StatCard
            title="Concluídas"
            value={counts.completed}
            iconName="checkmark-circle"
            accentColor={theme.colors.success}
          />
          <StatCard
            title="Atrasadas"
            value={counts.overdue}
            iconName="alert-circle"
            accentColor={counts.overdue > 0 ? theme.colors.danger : theme.colors.textSubtle}
          />
        </Grid>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={32} color={theme.colors.textSubtle} />
          <Text style={styles.emptyText}>Nenhuma visita para este dia</Text>
        </View>
      )}

      {alerts.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Alertas críticos</Text>
          <View style={styles.alertsList}>
            {alerts.map((alert) => (
              <Pressable
                key={alert.id}
                accessibilityRole="button"
                accessibilityLabel={alert.message}
                onPress={() => alert.visitId && handleAlert?.(alert.visitId)}
                style={styles.alertCard}
              >
                <Ionicons
                  name={getAlertIcon(alert.type)}
                  size={18}
                  color={theme.colors.danger}
                />
                <Text style={styles.alertMessage} numberOfLines={2}>
                  {alert.message}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.danger} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {employees.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>
            {`Equipe em campo · ${employees.length} técnico${employees.length > 1 ? "s" : ""}`}
          </Text>
          <View style={styles.staffList}>
            {visibleEmployees.map((emp, index) => (
              <View
                key={emp.id}
                style={[
                  styles.staffRow,
                  index === visibleEmployees.length - 1 && !hasMoreEmployees && styles.staffRowLast,
                ]}
              >
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName} numberOfLines={1}>
                    {emp.name}
                  </Text>
                </View>
                <View style={styles.staffStatusGroup}>
                  {emp.status === "busy" && emp.activeVisits > 0 && (
                    <Text style={styles.activeVisitsText}>{emp.activeVisits} ativa{emp.activeVisits > 1 ? "s" : ""}</Text>
                  )}
                  <Badge
                    label={getStatusLabel(emp.status)}
                    variant={getStatusVariant(emp.status)}
                  />
                </View>
              </View>
            ))}
            {hasMoreEmployees && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver todos os ${sortedEmployees.length} técnicos`}
                onPress={() => setExpandedStaff(true)}
                style={styles.expandButton}
              >
                <Text style={styles.expandText}>{`Ver todos (${sortedEmployees.length})`}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function getAlertIcon(type: AdminAlertSummary["type"]): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "overdue":
      return "time";
    case "problem":
      return "warning";
    case "outside_radius":
      return "location";
    default:
      return "alert-circle";
  }
}

function getStatusLabel(status: EmployeeOperationalStatus["status"]): string {
  switch (status) {
    case "busy":
      return "Em visita";
    case "available":
      return "Disponível";
    case "offline":
      return "Offline";
  }
}

function getStatusVariant(status: EmployeeOperationalStatus["status"]): "info" | "success" | "neutral" {
  switch (status) {
    case "busy":
      return "info";
    case "available":
      return "success";
    case "offline":
      return "neutral";
  }
}
