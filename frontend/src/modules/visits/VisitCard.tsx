import { Pressable, StyleSheet, Text, View } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import { theme } from "../../shared/ui/theme";

export function VisitCard({
  visit,
  onPress,
}: {
  visit: VisitDetails;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.client}>{visit.clientName}</Text>
        <Text style={styles.status}>{statusLabel(visit.status)}</Text>
      </View>
      <Text style={styles.meta}>{visit.scheduledFor}</Text>
      <Text style={styles.meta}>{visit.systemsCount} sistemas</Text>
      {visit.syncStatus !== "synced" && (
        <Text style={styles.sync}>Salvo no dispositivo</Text>
      )}
    </Pressable>
  );
}

function statusLabel(status: VisitDetails["status"]): string {
  return status === "in_progress" ? "Em andamento" : "Aguardando chegada";
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  client: { color: theme.colors.darkGray, fontSize: 17, fontWeight: "700" },
  status: { color: theme.colors.corporateBlue, fontSize: 12, fontWeight: "700" },
  meta: { color: theme.colors.nearBlack, fontSize: 14, marginTop: 6 },
  sync: { color: theme.colors.aqua, fontSize: 12, marginTop: 8 },
});
