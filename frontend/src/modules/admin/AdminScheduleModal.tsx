import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EmployeeSummary } from "@qqs/contracts";

import { theme } from "../../shared/ui/theme.js";
import { styles } from "./AdminScheduleModal.styles.js";

export type AdminScheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    clientName: string;
    clientAddress?: string;
    employeeId: string;
    scheduledFor: string;
    systems: Array<{ name: string; type: string }>;
  }) => Promise<void> | void;
  employees: EmployeeSummary[];
  loading?: boolean;
};

export function AdminScheduleModal({
  visible,
  onClose,
  onSave,
  employees,
  loading = false,
}: AdminScheduleModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    () => employees[0]?.id ?? "employee-001",
  );
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState("09:00");
  const [newSystemName, setNewSystemName] = useState("");
  const [systems, setSystems] = useState<Array<{ name: string; type: string }>>([
    { name: "Torre de Resfriamento 1", type: "tower" },
  ]);

  function handleAddSystem() {
    if (!newSystemName.trim()) return;
    setSystems((prev) => [...prev, { name: newSystemName.trim(), type: "equipment" }]);
    setNewSystemName("");
  }

  function handleRemoveSystem(index: number) {
    setSystems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!clientName.trim()) return;
    const scheduledFor = `${date}T${time}:00.000Z`;
    await onSave({
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim() || undefined,
      employeeId: selectedEmployeeId,
      scheduledFor,
      systems,
    });
    setClientName("");
    setClientAddress("");
    onClose();
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
      visible={visible}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.corporateBlue} />
              <Text style={styles.title}>Agendar Nova Visita</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar modal"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Preencha os dados do cliente e selecione o técnico responsável:
          </Text>

          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Empresa / Cliente *</Text>
            <TextInput
              accessibilityLabel="Nome da empresa"
              onChangeText={setClientName}
              placeholder="Ex.: Gases da Amazônia"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={clientName}
            />

            <Text style={styles.label}>Endereço do Local</Text>
            <TextInput
              accessibilityLabel="Endereço do local"
              onChangeText={setClientAddress}
              placeholder="Ex.: Av. Danilo de Mattos Areosa, 1000"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              value={clientAddress}
            />

            <Text style={styles.label}>Técnico Responsável *</Text>
            <View style={styles.employeeChips}>
              {employees.map((emp) => {
                const isSelected = emp.id === selectedEmployeeId;
                return (
                  <Pressable
                    key={emp.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar técnico ${emp.name}`}
                    onPress={() => setSelectedEmployeeId(emp.id)}
                    style={[styles.employeeChip, isSelected && styles.employeeChipSelected]}
                  >
                    <Text
                      style={[
                        styles.employeeChipText,
                        isSelected && styles.employeeChipTextSelected,
                      ]}
                    >
                      {emp.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Data *</Text>
                <TextInput
                  accessibilityLabel="Data do agendamento"
                  onChangeText={setDate}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={date}
                />
              </View>

              <View style={styles.halfCol}>
                <Text style={styles.label}>Horário *</Text>
                <TextInput
                  accessibilityLabel="Horário do agendamento"
                  onChangeText={setTime}
                  placeholder="09:00"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  value={time}
                />
              </View>
            </View>

            <Text style={styles.label}>Sistemas para Vistoria ({systems.length})</Text>
            <View style={styles.systemAddRow}>
              <TextInput
                accessibilityLabel="Nome do sistema a vistoriar"
                onChangeText={setNewSystemName}
                placeholder="Ex.: Caldeira 2, Chiller..."
                placeholderTextColor="#94A3B8"
                style={styles.systemAddInput}
                value={newSystemName}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar sistema"
                onPress={handleAddSystem}
                style={styles.addSystemButton}
              >
                <Text style={styles.addSystemButtonText}>+ Adicionar</Text>
              </Pressable>
            </View>

            <View style={styles.systemsList}>
              {systems.map((s, idx) => (
                <View key={`${s.name}-${idx}`} style={styles.systemItem}>
                  <Ionicons name="hardware-chip-outline" size={13} color={theme.colors.corporateBlue} />
                  <Text style={styles.systemItemText}>{s.name}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${s.name}`}
                    onPress={() => handleRemoveSystem(idx)}
                  >
                    <Ionicons name="close-circle" size={15} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancelar agendamento"
                disabled={loading}
                onPress={onClose}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Salvar agendamento"
                disabled={loading || !clientName.trim()}
                onPress={handleSubmit}
                style={[
                  styles.saveButton,
                  (!clientName.trim() || loading) && styles.saveButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Confirmar Agendamento</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
