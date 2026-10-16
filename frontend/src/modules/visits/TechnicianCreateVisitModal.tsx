import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { ClientSummary } from "@qqs/contracts";

import { ClientPicker } from "../clients/ClientPicker";
import { styles } from "./TechnicianCreateVisitModal.styles";

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
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Adicionar visita</Text>
          {clients.length === 0 ? (
            <Text style={styles.emptyText}>
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
            style={styles.input}
          />
          {!validDate && <Text style={styles.errorText}>Data e horário inválidos.</Text>}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salvar visita do técnico"
            disabled={!canSave}
            onPress={save}
            style={[styles.saveButton, canSave ? styles.saveButtonEnabled : styles.saveButtonDisabled]}
          >
            <Text style={styles.saveText}>Salvar visita</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar criação da visita"
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
