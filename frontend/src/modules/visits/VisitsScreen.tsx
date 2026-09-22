import { FlatList, Text, View } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import { VisitCard } from "./VisitCard";
import { styles } from "./VisitsScreen.styles";

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
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Nenhuma visita atribuída</Text>
            <Text style={styles.emptyBody}>
              Quando uma empresa for atribuída a você, ela aparece aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <VisitCard visit={item} onPress={() => onOpen(item.id)} />
        )}
      />
    </View>
  );
}
