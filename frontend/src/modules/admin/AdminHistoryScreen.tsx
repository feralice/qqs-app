import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
    <View>
      <Text>Histórico de visitas</Text>
      {isOffline && <Text>Exibindo dados salvos offline</Text>}
      <TextInput accessibilityLabel="Data inicial" placeholder="Data inicial" />
      <TextInput accessibilityLabel="Data final" placeholder="Data final" />
      <TextInput accessibilityLabel="Filtrar cliente" placeholder="Cliente" />
      {isLoading ? (
        <Text>Carregando histórico</Text>
      ) : items.length === 0 ? (
        <Text>Nenhuma visita encontrada</Text>
      ) : (
        items.map((item) => (
          <Pressable key={item.id} onPress={() => onOpenVisit?.(item.id)} accessibilityRole="button">
            <Text>{item.clientName}</Text>
            <Text>{item.status}</Text>
            <Text>{new Date(item.scheduledFor).toLocaleDateString("pt-BR")}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}
