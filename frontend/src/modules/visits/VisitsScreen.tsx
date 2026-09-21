import { FlatList, StyleSheet, Text, View } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import { VisitCard } from "./VisitCard";
import { theme } from "../../shared/ui/theme";

export function VisitsScreen({
  visits,
  onOpen,
}: {
  visits: VisitDetails[];
  onOpen: (visitId: string) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas visitas</Text>
      <Text style={styles.subtitle}>Serviços atribuídos para você</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={visits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma visita atribuída.</Text>}
        renderItem={({ item }) => (
          <VisitCard visit={item} onPress={() => onOpen(item.id)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  title: { color: theme.colors.darkGray, fontSize: 28, fontWeight: "700" },
  subtitle: { color: theme.colors.nearBlack, fontSize: 15, marginTop: 6 },
  list: { paddingTop: theme.spacing.lg },
  empty: { color: theme.colors.nearBlack, marginTop: theme.spacing.lg },
});
