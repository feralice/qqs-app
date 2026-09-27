import React from "react";
import { Text, View } from "react-native";
import type { AdminDashboardSummary as DashboardSummary } from "@qqs/contracts";

export type AdminDashboardSummaryProps = {
  summary?: DashboardSummary;
  isLoading?: boolean;
  isStale?: boolean;
  onOpenAlert?: (alertId: string) => void;
  onOpenVisit?: (visitId: string) => void;
};

export function AdminDashboardSummary({
  summary,
  isLoading = false,
  isStale = false,
  onOpenAlert,
  onOpenVisit,
}: AdminDashboardSummaryProps) {
  if (isLoading && !summary) {
    return <Text>Carregando resumo</Text>;
  }

  if (!summary) {
    return <Text>Resumo indisponível</Text>;
  }

  const { counts } = summary;
  const hasVisits = counts.scheduled + counts.inProgress + counts.completed > 0;

  return (
    <View accessibilityLabel="Resumo do dia">
      <Text>Resumo do dia</Text>
      {isStale && <Text>Dados podem estar desatualizados</Text>}
      <View>
        <Text>Agendadas: {counts.scheduled}</Text>
        <Text>Em andamento: {counts.inProgress}</Text>
        <Text>Concluídas: {counts.completed}</Text>
        <Text>Atrasadas: {counts.overdue}</Text>
      </View>
      {!hasVisits && <Text>Nenhuma visita para este dia</Text>}
      {summary.alerts.length > 0 && (
        <View>
          <Text>Alertas críticos</Text>
          {summary.alerts.map((alert) => (
            <Text
              key={alert.id}
              accessibilityRole="button"
              onPress={() => {
                onOpenAlert?.(alert.id);
                onOpenVisit?.(alert.visitId);
              }}
            >
              {alert.message}
            </Text>
          ))}
        </View>
      )}
      <Text>
        Atualizado em {new Date(summary.lastUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );
}
