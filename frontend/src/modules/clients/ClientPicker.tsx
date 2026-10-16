import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { ClientSummary } from "@qqs/contracts";

import { styles } from "./ClientPicker.styles";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function matchesClient(client: ClientSummary, query: string): boolean {
  const text = normalize(query.trim());
  if (!text) return true;
  const digits = query.replace(/\D/g, "");
  return normalize(client.name).includes(text) || (digits.length > 0 && client.cnpj.includes(digits));
}

export function ClientPicker({
  clients,
  selectedId,
  onSelect,
}: {
  clients: ClientSummary[];
  selectedId?: string;
  onSelect: (client: ClientSummary) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => clients.filter((client) => matchesClient(client, query)), [clients, query]);

  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Buscar empresa"
        placeholder="Buscar por nome ou CNPJ"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />
      {visible.map((client) => {
        const selected = client.id === selectedId;
        return (
          <Pressable
            key={client.id}
            accessibilityRole="button"
            accessibilityLabel={`Escolher ${client.name}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(client)}
            style={[styles.itemCard, selected && styles.itemCardSelected]}
          >
            <Text style={styles.itemName}>{client.name}</Text>
            <Text style={styles.itemAddress}>{client.address}</Text>
          </Pressable>
        );
      })}
      {visible.length === 0 && clients.length > 0 && (
        <Text style={styles.emptyText}>Nenhuma empresa encontrada para essa busca.</Text>
      )}
    </View>
  );
}
