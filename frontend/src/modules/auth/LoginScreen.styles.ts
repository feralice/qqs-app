import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceTint,
    flex: 1,
  },
  screen: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  brand: {
    color: theme.colors.corporateBlue,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: -0.5,
  },
  tagline: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    elevation: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.md,
  },
  error: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    textAlign: "center",
  },
  submitButton: { marginTop: theme.spacing.sm },
  switchLink: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: theme.spacing.lg,
  },
});
