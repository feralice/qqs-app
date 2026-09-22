import { ActivityIndicator, Pressable, Text, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../theme";
import { styles } from "./Button.styles";

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? theme.colors.white : theme.colors.nearBlack} />
      ) : (
        <Text style={variant === "primary" ? styles.primaryText : styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );
}
