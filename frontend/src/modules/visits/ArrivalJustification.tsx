import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { theme } from "../../shared/ui/theme";

export function ArrivalJustification({
  distanceMeters,
  radiusMeters,
  loading = false,
  onConfirm,
  onCancel,
}: {
  distanceMeters?: number;
  radiusMeters?: number;
  loading?: boolean;
  onConfirm: (justification: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const canConfirm = text.trim().length > 0 && !loading;

  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.corporateBlue,
        borderRadius: theme.radius.md,
        borderWidth: 2,
        gap: theme.spacing.sm,
        marginVertical: theme.spacing.md,
        padding: theme.spacing.md,
      }}
    >
      <Text style={{ color: theme.colors.darkGray, fontSize: 16, fontWeight: "700" }}>
        {distanceMeters === undefined
          ? "Localização indisponível"
          : `Você está a ${distanceMeters} m da empresa (raio de ${radiusMeters} m)`}
      </Text>
      <Text style={{ color: theme.colors.darkGray }}>
        Explique o motivo para registrar a chegada. A visita ficará marcada para conferência do gestor.
      </Text>
      <TextInput
        accessibilityLabel="Justificativa da chegada"
        placeholder="Justificativa"
        multiline
        value={text}
        onChangeText={setText}
        style={{
          borderColor: theme.colors.lightBlue,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          color: theme.colors.darkGray,
          minHeight: 72,
          padding: 12,
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Confirmar chegada com justificativa"
        disabled={!canConfirm}
        onPress={() => onConfirm(text.trim())}
        style={{
          backgroundColor: canConfirm ? theme.colors.corporateBlue : theme.colors.lightBlue,
          borderRadius: theme.radius.md,
          padding: 14,
        }}
      >
        <Text style={{ color: theme.colors.white, fontWeight: "700", textAlign: "center" }}>Confirmar chegada</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Cancelar justificativa" onPress={onCancel}>
        <Text style={{ color: theme.colors.darkGray, textAlign: "center" }}>Cancelar</Text>
      </Pressable>
    </View>
  );
}
