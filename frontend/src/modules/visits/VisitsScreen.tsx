import { FlatList, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { VisitDetails } from "@qqs/contracts";

import { VisitCard } from "./VisitCard";
import { styles } from "./VisitsScreen.styles";
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
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.title}>Minhas visitas</Text>
          <Text style={styles.subtitle}>Visitas e checklists do dia</Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="calendar" size={14} color={theme.colors.corporateBlue} />
          <Text style={styles.countText}>{visits.length}</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={visits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="clipboard-outline" size={32} color={theme.colors.corporateBlue} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma visita atribuída</Text>
            <Text style={styles.emptyBody}>
              Quando uma empresa for atribuída a você, ela aparecerá nesta lista.
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
