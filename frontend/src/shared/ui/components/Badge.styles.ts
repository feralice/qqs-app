import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
  },
  info: { backgroundColor: theme.colors.surfaceTint },
  success: { backgroundColor: theme.colors.successBg },
  warning: { backgroundColor: theme.colors.warningBg },
  danger: { backgroundColor: theme.colors.dangerBg },
  neutral: { backgroundColor: theme.colors.surfaceAlt },

  dot: {
    borderRadius: theme.radius.pill,
    height: 6,
    marginRight: 6,
    width: 6,
  },
  infoDot: { backgroundColor: theme.colors.corporateBlue },
  successDot: { backgroundColor: theme.colors.success },
  warningDot: { backgroundColor: theme.colors.warning },
  dangerDot: { backgroundColor: theme.colors.danger },
  neutralDot: { backgroundColor: theme.colors.textMuted },

  text: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  infoText: { color: theme.colors.infoText },
  successText: { color: theme.colors.successText },
  warningText: { color: theme.colors.warningText },
  dangerText: { color: theme.colors.danger },
  neutralText: { color: theme.colors.textMuted },
});
