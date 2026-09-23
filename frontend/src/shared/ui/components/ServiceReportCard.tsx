import React from "react";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { styles } from "./ServiceReportCard.styles";

export type ServiceReportCardProps = {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
};

export function ServiceReportCard({
  value,
  onChangeText,
  editable = true,
}: ServiceReportCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="document-text" size={18} color={theme.colors.corporateBlue} />
          <Text style={styles.title}>Relatório do Serviço</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Descreva em detalhes as manutenções, dosagens e testes executados:
      </Text>

      <TextInput
        accessibilityLabel="Descrição do serviço executado"
        editable={editable}
        multiline
        numberOfLines={4}
        onChangeText={onChangeText}
        placeholder="Ex.: Realizada limpeza química preventiva na Torre 1, medição de pH = 7.4 e dosagem de biocida..."
        placeholderTextColor="#94A3B8"
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
      />
      <Text style={styles.charCount}>{value.length} caracteres</Text>
    </View>
  );
}
