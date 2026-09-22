import { Pressable, Text, View } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import { styles } from "./VisitCard.styles";

export function VisitCard({
  visit,
  onPress,
}: {
  visit: VisitDetails;
  onPress: () => void;
}) {
  const inProgress = visit.status === "in_progress";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.client}>{visit.clientName}</Text>
        <View style={[styles.badge, inProgress ? styles.badgeInProgress : styles.badgeAssigned]}>
          <Text style={styles.badgeText}>{statusLabel(visit.status)}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{formatSchedule(visit.scheduledFor)}</Text>
      <Text style={styles.meta}>{visit.systemsCount} sistemas</Text>
      {visit.syncStatus !== "synced" && <Text style={styles.sync}>● Salvo no dispositivo</Text>}
    </Pressable>
  );
}

function statusLabel(status: VisitDetails["status"]): string {
  return status === "in_progress" ? "Em andamento" : "Aguardando chegada";
}

function formatSchedule(scheduledFor: string): string {
  const date = new Date(scheduledFor);
  if (Number.isNaN(date.getTime())) return scheduledFor;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
