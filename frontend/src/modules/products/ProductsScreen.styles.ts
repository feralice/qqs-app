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
  form: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unitRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  unitOption: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  unitOptionSelected: {
    backgroundColor: theme.colors.corporateBlue,
    borderColor: theme.colors.corporateBlue,
  },
  unitText: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semibold,
  },
  unitTextSelected: {
    color: theme.colors.white,
  },
  error: {
    color: theme.colors.danger,
    fontWeight: theme.typography.weights.bold,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    padding: 12,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 4,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: theme.colors.text,
    flex: 1,
    fontWeight: theme.typography.weights.bold,
  },
  muted: {
    color: theme.colors.textMuted,
  },
  linkButton: {
    justifyContent: "center",
    minHeight: 44,
  },
  linkText: {
    color: theme.colors.corporateBlue,
    fontWeight: theme.typography.weights.bold,
  },
});
