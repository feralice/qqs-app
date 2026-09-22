import { StyleSheet } from "react-native";

import { theme } from "../theme";

export const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  primary: { backgroundColor: theme.colors.corporateBlue },
  secondary: { backgroundColor: theme.colors.aqua },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  primaryText: { color: theme.colors.white, fontWeight: "700", fontSize: 16 },
  secondaryText: { color: theme.colors.nearBlack, fontWeight: "700", fontSize: 16 },
});
