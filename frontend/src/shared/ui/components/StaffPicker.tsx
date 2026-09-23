import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EmployeeSummary } from "@qqs/contracts";

import { theme } from "../theme";
import { styles } from "./StaffPicker.styles";

export type StaffPickerProps = {
  employees: EmployeeSummary[];
  selectedIds: string[];
  onToggle: (employeeId: string) => void;
  editable?: boolean;
};

export function StaffPicker({
  employees,
  selectedIds,
  onToggle,
  editable = true,
}: StaffPickerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="people" size={18} color={theme.colors.corporateBlue} />
          <Text style={styles.title}>Equipe presente</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {selectedIds.length} {selectedIds.length === 1 ? "colaborador" : "colaboradores"}
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Indique quem esteve em campo durante esta visita:
      </Text>

      <View style={styles.list}>
        {employees.map((emp) => {
          const isSelected = selectedIds.includes(emp.id);

          return (
            <Pressable
              key={emp.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Selecionar ${emp.name}`}
              disabled={!editable}
              onPress={() => onToggle(emp.id)}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{emp.name}</Text>
                <Text style={styles.itemEmail}>{emp.email}</Text>
              </View>

              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color={theme.colors.white} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
