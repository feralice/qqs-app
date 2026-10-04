import React, { useEffect, useState } from "react";
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
import type { ClientSummary, EmployeeSummary } from "@qqs/contracts";

import { ClientPicker } from "../clients/ClientPicker";
import { theme } from "../../shared/ui/theme";
import { styles } from "./AdminScheduleModal.styles";

export type AdminScheduleDraft = {
  client: ClientSummary;
  employeeId: string;
  scheduledFor: string;
};

export type AdminScheduleModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: AdminScheduleDraft) => Promise<void> | void;
  employees: EmployeeSummary[];
  clients: ClientSummary[];
  loading?: boolean;
};

// Data e hora digitadas são do fuso do aparelho (Manaus, UTC-4), não UTC.
export function toScheduledFor(date: string, time: string): string | undefined {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return undefined;
  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hours, minutes] = timeMatch.slice(1).map(Number);
  const local = new Date(year, month - 1, day, hours, minutes);
  const sameFields =
    local.getFullYear() === year &&
    local.getMonth() === month - 1 &&
    local.getDate() === day &&
    local.getHours() === hours &&
    local.getMinutes() === minutes;
  return sameFields ? local.toISOString() : undefined;
}

function localDateString(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function AdminScheduleModal({
  visible,
  onClose,
  onSave,
  employees,
  clients,
  loading = false,
}: AdminScheduleModalProps) {
  const [client, setClient] = useState<ClientSummary>();
  const [dateError, setDateError] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(employees[0]?.id);
  const [date, setDate] = useState(localDateString);

  useEffect(() => {
    if (!employees.some((employee) => employee.id === selectedEmployeeId)) {
      setSelectedEmployeeId(employees[0]?.id);
    }
  }, [employees, selectedEmployeeId]);
  const [time, setTime] = useState("09:00");
  async function handleSubmit() {
    const scheduledFor = toScheduledFor(date, time);
    setDateError(!scheduledFor);
    if (!client || !scheduledFor || !selectedEmployeeId) return;
    await onSave({ client, employeeId: selectedEmployeeId, scheduledFor });
    setClient(undefined);
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
            Escolha a empresa cadastrada e o técnico responsável:
          </Text>

          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Empresa / Cliente *</Text>
            {clients.length === 0 ? (
              <Text style={styles.subtitle}>Cadastre uma empresa antes de agendar.</Text>
            ) : (
              <ClientPicker clients={clients} selectedId={client?.id} onSelect={setClient} />
            )}

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

            {dateError && <Text style={styles.subtitle}>Data ou horário inválidos.</Text>}

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
                disabled={loading || !client || !selectedEmployeeId}
                onPress={handleSubmit}
                style={[
                  styles.saveButton,
                  (!client || loading) && styles.saveButtonDisabled,
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
