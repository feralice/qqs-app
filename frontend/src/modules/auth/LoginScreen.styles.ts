import { StyleSheet } from "react-native";

import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.lightBlue,
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  logoWrap: { alignItems: "center", marginBottom: theme.spacing.lg * 2 },
  brand: { color: theme.colors.corporateBlue, fontSize: 32, fontWeight: "800" },
  tagline: { color: theme.colors.darkGray, fontSize: 15, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { color: theme.colors.darkGray, fontSize: 20, fontWeight: "700", marginBottom: theme.spacing.md },
  error: { color: "#C0392B", marginBottom: theme.spacing.md, textAlign: "center" },
  submitButton: { marginTop: theme.spacing.sm },
});
