import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { styles } from "./ArrivalJustification.styles";

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
    <View style={styles.container}>
      <Text style={styles.title}>
        {distanceMeters === undefined
          ? "Localização indisponível"
          : `Você está a ${distanceMeters} m da empresa (raio de ${radiusMeters} m)`}
      </Text>
      <Text style={styles.body}>
        Explique o motivo para registrar a chegada. A visita ficará marcada para conferência do gestor.
      </Text>
      <TextInput
        accessibilityLabel="Justificativa da chegada"
        placeholder="Justificativa"
        multiline
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Confirmar chegada com justificativa"
        disabled={!canConfirm}
        onPress={() => onConfirm(text.trim())}
        style={[styles.confirmButton, canConfirm ? styles.confirmButtonEnabled : styles.confirmButtonDisabled]}
      >
        <Text style={styles.confirmText}>Confirmar chegada</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancelar justificativa"
        onPress={onCancel}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}
