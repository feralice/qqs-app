import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { styles } from "./StatCard.styles";

export function StatCard({
  title,
  value,
  subtitle,
  iconName,
  accentColor = theme.colors.corporateBlue,
  trend,
  style,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  trend?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: `${accentColor}15` }]}>
          <Ionicons name={iconName} size={20} color={accentColor} />
        </View>
        {trend && (
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={12} color="#27AE60" />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
