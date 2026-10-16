import { StyleSheet } from "react-native";

import { theme } from "../theme";

export const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  primary: { backgroundColor: theme.colors.corporateBlue },
  secondary: { backgroundColor: theme.colors.aqua },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  primaryText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  secondaryText: {
    color: theme.colors.nearBlack,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
});
