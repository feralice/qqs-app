import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { styles } from "./AdminHistoryScreen.styles";

export type AdminHistoryItem = {
  id: string;
  clientName: string;
  status: string;
  scheduledFor: string;
};

export type AdminHistoryScreenProps = {
  items?: AdminHistoryItem[];
  isLoading?: boolean;
  isOffline?: boolean;
  onOpenVisit?: (visitId: string) => void;
};

export function AdminHistoryScreen({ items = [], isLoading = false, isOffline = false, onOpenVisit }: AdminHistoryScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de visitas</Text>
      {isOffline && <Text style={styles.offlineNotice}>Exibindo dados salvos offline</Text>}
      <TextInput accessibilityLabel="Data inicial" placeholder="Data inicial" style={styles.filterInput} />
      <TextInput accessibilityLabel="Data final" placeholder="Data final" style={styles.filterInput} />
      <TextInput accessibilityLabel="Filtrar cliente" placeholder="Cliente" style={styles.filterInput} />
      {isLoading ? (
        <Text style={styles.statusText}>Carregando histórico</Text>
      ) : items.length === 0 ? (
        <Text style={styles.statusText}>Nenhuma visita encontrada</Text>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onOpenVisit?.(item.id)}
            accessibilityRole="button"
            style={styles.itemCard}
          >
            <Text style={styles.itemName}>{item.clientName}</Text>
            <Text style={styles.itemStatus}>{item.status}</Text>
            <Text style={styles.itemDate}>{new Date(item.scheduledFor).toLocaleDateString("pt-BR")}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}
