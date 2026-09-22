import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { VisitDetails } from "@qqs/contracts";

import { theme } from "../../shared/ui/theme";
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
      <View style={styles.headerRow}>
        <View style={styles.clientTitleGroup}>
          <Text style={styles.client}>{visit.clientName}</Text>
          <View style={[styles.badge, inProgress ? styles.badgeInProgress : styles.badgeAssigned]}>
            <View style={[styles.badgeDot, inProgress && styles.badgeDotInProgress]} />
            <Text style={styles.badgeText}>{statusLabel(visit.status)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8A8F98" />
      </View>

      <View style={styles.infoGroup}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={15} color={theme.colors.corporateBlue} />
          <Text style={styles.metaText}>{formatSchedule(visit.scheduledFor)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="layers-outline" size={15} color={theme.colors.darkGray} />
          <Text style={styles.metaText}>{visit.systemsCount} sistemas para vistoria</Text>
        </View>
      </View>

      {visit.syncStatus !== "synced" && (
        <View style={styles.syncBadge}>
          <Ionicons name="cloud-offline-outline" size={13} color={theme.colors.corporateBlue} />
          <Text style={styles.syncText}>Salvo offline no aparelho</Text>
        </View>
      )}
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
