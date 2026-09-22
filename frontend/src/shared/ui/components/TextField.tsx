import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { PLACEHOLDER_COLOR, styles } from "./TextField.styles";

export function TextField({
  label,
  error,
  secureTextEntry,
  onFocus,
  onBlur,
  ...inputProps
}: {
  label: string;
  error?: string;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={PLACEHOLDER_COLOR}
          secureTextEntry={isPasswordField && !revealed}
          style={[
            styles.input,
            isPasswordField && styles.inputWithToggle,
            focused && styles.inputFocused,
            error && styles.inputError,
          ]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {isPasswordField && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Ocultar senha" : "Mostrar senha"}
            hitSlop={8}
            onPress={() => setRevealed((current) => !current)}
            style={styles.toggle}
          >
            <Ionicons
              name={revealed ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={theme.colors.nearBlack}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
