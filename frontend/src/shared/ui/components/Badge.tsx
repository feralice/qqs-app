import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { styles } from "./Badge.styles";

export type BadgeVariant = "info" | "success" | "warning" | "danger" | "neutral";

export function Badge({
  label,
  variant = "info",
  iconName,
  showDot = false,
  style,
}: {
  label: string;
  variant?: BadgeVariant;
  iconName?: keyof typeof Ionicons.glyphMap;
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {showDot && <View style={[styles.dot, styles[`${variant}Dot`]]} />}
      {iconName && (
        <Ionicons
          name={iconName}
          size={12}
          color={iconColors[variant]}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const iconColors: Record<BadgeVariant, string> = {
  info: theme.colors.corporateBlue,
  success: "#27AE60",
  warning: "#D68910",
  danger: "#C0392B",
  neutral: theme.colors.darkGray,
};
