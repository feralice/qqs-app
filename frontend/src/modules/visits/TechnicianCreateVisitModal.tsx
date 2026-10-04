import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { ClientSummary } from "@qqs/contracts";

import { ClientPicker } from "../clients/ClientPicker";
import { theme } from "../../shared/ui/theme";

export type TechnicianVisitDraft = {
  client: ClientSummary;
  scheduledFor: string;
};

export type TechnicianCreateVisitModalProps = {
  visible: boolean;
  clients: ClientSummary[];
  onClose: () => void;
  onSave: (draft: TechnicianVisitDraft) => Promise<void> | void;
};

export function TechnicianCreateVisitModal({ visible, clients, onClose, onSave }: TechnicianCreateVisitModalProps) {
  const [client, setClient] = useState<ClientSummary>();
  const [scheduledFor, setScheduledFor] = useState(() => new Date().toISOString());
  const validDate = !Number.isNaN(Date.parse(scheduledFor));
  const canSave = Boolean(client) && validDate;

  async function save() {
    if (!client || !validDate) return;
    await onSave({ client, scheduledFor: new Date(scheduledFor).toISOString() });
    setClient(undefined);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ backgroundColor: theme.colors.white, marginTop: "auto", maxHeight: "85%", padding: 20 }}>
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          <Text style={{ color: theme.colors.darkGray, fontSize: 20, fontWeight: "700" }}>Adicionar visita</Text>
          {clients.length === 0 ? (
            <Text style={{ color: theme.colors.darkGray }}>
              Nenhuma empresa disponível. Conecte-se à internet uma vez para baixar a lista de empresas.
            </Text>
          ) : (
            <ClientPicker clients={clients} selectedId={client?.id} onSelect={setClient} />
          )}
          <TextInput
            accessibilityLabel="Data e horário da visita"
            placeholder="Data e horário"
            value={scheduledFor}
            onChangeText={setScheduledFor}
          />
          {!validDate && <Text style={{ color: theme.colors.darkGray }}>Data e horário inválidos.</Text>}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salvar visita do técnico"
            disabled={!canSave}
            onPress={save}
            style={{
              backgroundColor: canSave ? theme.colors.corporateBlue : theme.colors.lightBlue,
              borderRadius: theme.radius.md,
              padding: 14,
            }}
          >
            <Text style={{ color: theme.colors.white, fontWeight: "700", textAlign: "center" }}>Salvar visita</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar criação da visita" onPress={onClose}>
            <Text style={{ color: theme.colors.darkGray, textAlign: "center" }}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
