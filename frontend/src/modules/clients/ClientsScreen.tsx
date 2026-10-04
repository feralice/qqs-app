import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ClientSummary, CreateClientRequest } from "@qqs/contracts";

import { Badge } from "../../shared/ui/components/Badge";
import { theme } from "../../shared/ui/theme";
import type { ClientApi } from "./client-api";
import { ApiError } from "../../shared/http/api-error";
import { ClientForm } from "./ClientForm";

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
    <ScrollView contentContainerStyle={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
      <Text style={{ color: theme.colors.darkGray, fontSize: 22, fontWeight: "700" }}>Empresas</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={creating ? "Fechar cadastro" : "Nova empresa"}
        onPress={() => setCreating((open) => !open)}
        style={{ backgroundColor: theme.colors.corporateBlue, borderRadius: theme.radius.md, padding: 12 }}
      >
        <Text style={{ color: theme.colors.white, fontWeight: "700", textAlign: "center" }}>
          {creating ? "Fechar cadastro" : "+ Nova empresa"}
        </Text>
      </Pressable>

      {creating && <ClientForm submitting={saving} error={formError} onSubmit={create} />}

      {loadError && <Text style={{ color: theme.colors.darkGray }}>Não foi possível carregar as empresas.</Text>}

      {clients.map((client) => (
        <View
          key={client.id}
          style={{
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.lightBlue,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            gap: 4,
            padding: theme.spacing.md,
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: theme.colors.darkGray, flex: 1, fontWeight: "700" }}>{client.name}</Text>
            <Badge label={client.active ? "Ativa" : "Inativa"} variant={client.active ? "success" : "neutral"} />
          </View>
          <Text style={{ color: theme.colors.darkGray }}>{client.address}</Text>
          <Text style={{ color: theme.colors.darkGray }}>
            {`Raio de ${client.radiusMeters} m · ${client.systems.length} sistemas`}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${client.active ? "Inativar" : "Reativar"} ${client.name}`}
            onPress={() => toggleActive(client)}
          >
            <Text style={{ color: theme.colors.corporateBlue, fontWeight: "700" }}>
              {client.active ? "Inativar" : "Reativar"}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
