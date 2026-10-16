import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ClientSummary, CreateClientRequest } from "@qqs/contracts";

import { Badge } from "../../shared/ui/components/Badge";
import type { ClientApi } from "./client-api";
import { ApiError } from "../../shared/http/api-error";
import { ClientForm } from "./ClientForm";
import { styles } from "./ClientsScreen.styles";

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return "CNPJ já cadastrado em outra empresa.";
  if (error instanceof ApiError && error.status === 400) return "Dados inválidos. Confira os campos.";
  return "Não foi possível salvar. Verifique a conexão.";
}

export function ClientsScreen({ api }: { api: ClientApi }) {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>();

  const load = useCallback(async () => {
    try {
      setClients(await api.listClients({ includeInactive: true }));
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(request: CreateClientRequest) {
    setSaving(true);
    setFormError(undefined);
    try {
      await api.createClient(request);
      setCreating(false);
      await load();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(client: ClientSummary) {
    const updated = await api.updateClient(client.id, { active: !client.active });
    setClients((current) => current.map((item) => (item.id === client.id ? updated : item)));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Empresas</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={creating ? "Fechar cadastro" : "Nova empresa"}
        onPress={() => setCreating((open) => !open)}
        style={styles.newClientButton}
      >
        <Text style={styles.newClientButtonText}>
          {creating ? "Fechar cadastro" : "+ Nova empresa"}
        </Text>
      </Pressable>

      {creating && <ClientForm submitting={saving} error={formError} onSubmit={create} />}

      {loadError && <Text style={styles.errorText}>Não foi possível carregar as empresas.</Text>}

      {clients.map((client) => (
        <View key={client.id} style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Badge label={client.active ? "Ativa" : "Inativa"} variant={client.active ? "success" : "neutral"} />
          </View>
          <Text style={styles.clientAddress}>{client.address}</Text>
          <Text style={styles.clientMeta}>
            {`Raio de ${client.radiusMeters} m · ${client.systems.length} sistemas`}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${client.active ? "Inativar" : "Reativar"} ${client.name}`}
            onPress={() => toggleActive(client)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {client.active ? "Inativar empresa" : "Reativar empresa"}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
