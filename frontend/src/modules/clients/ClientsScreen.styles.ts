import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  newClientButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    padding: 12,
  },
  newClientButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
  },
  errorText: {
    color: theme.colors.text,
  },
  clientCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 4,
    padding: theme.spacing.lg,
  },
  clientHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clientName: {
    color: theme.colors.text,
    flex: 1,
    fontWeight: theme.typography.weights.bold,
  },
  clientAddress: {
    color: theme.colors.textMuted,
  },
  clientMeta: {
    color: theme.colors.textMuted,
  },
  toggleButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  toggleText: {
    color: theme.colors.corporateBlue,
    fontWeight: theme.typography.weights.bold,
  },
});
