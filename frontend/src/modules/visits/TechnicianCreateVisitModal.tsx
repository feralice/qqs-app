import React, { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

export type TechnicianVisitDraft = {
  clientName: string;
  clientAddress?: string;
  scheduledFor: string;
  systems: Array<{ name: string; type: string }>;
};

export type TechnicianCreateVisitModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: TechnicianVisitDraft) => Promise<void> | void;
};

export function TechnicianCreateVisitModal({ visible, onClose, onSave }: TechnicianCreateVisitModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [scheduledFor, setScheduledFor] = useState(() => new Date(Date.now() + 60 * 60 * 1000).toISOString());

  async function save() {
    if (!clientName.trim()) return;
    await onSave({ clientName: clientName.trim(), clientAddress: clientAddress.trim() || undefined, scheduledFor, systems: [] });
    setClientName("");
    setClientAddress("");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ backgroundColor: "white", marginTop: "auto", padding: 20, gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Adicionar visita</Text>
        <TextInput accessibilityLabel="Nome da empresa" placeholder="Nome da empresa" value={clientName} onChangeText={setClientName} />
        <TextInput accessibilityLabel="Endereço da empresa" placeholder="Endereço" value={clientAddress} onChangeText={setClientAddress} />
        <TextInput accessibilityLabel="Data e horário da visita" placeholder="Data e horário ISO" value={scheduledFor} onChangeText={setScheduledFor} />
        <Pressable accessibilityRole="button" accessibilityLabel="Salvar visita do técnico" onPress={save}>
          <Text>Salvar visita</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Cancelar criação da visita" onPress={onClose}>
          <Text>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
