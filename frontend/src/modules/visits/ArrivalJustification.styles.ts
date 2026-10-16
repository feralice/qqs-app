import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
  },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    minHeight: 72,
    padding: 12,
  },
  confirmButton: {
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    padding: 14,
  },
  confirmButtonEnabled: {
    backgroundColor: theme.colors.corporateBlue,
  },
  confirmButtonDisabled: {
    backgroundColor: theme.colors.lightBlue,
  },
  confirmText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelText: {
    color: theme.colors.textMuted,
    textAlign: "center",
  },
});
