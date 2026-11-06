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
  subtitle: {
    color: theme.colors.textMuted,
  },
  systemCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  systemName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginTop: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  entry: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  entryTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semibold,
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    flexBasis: 120,
    flexGrow: 1,
    fontSize: theme.typography.sizes.md,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  muted: {
    color: theme.colors.textMuted,
  },
  chip: {
    borderColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  chipText: {
    color: theme.colors.corporateBlue,
    fontWeight: theme.typography.weights.semibold,
  },
  linkButton: {
    justifyContent: "center",
    minHeight: 44,
  },
  linkText: {
    color: theme.colors.corporateBlue,
    fontWeight: theme.typography.weights.bold,
  },
  removeText: {
    color: theme.colors.danger,
    fontWeight: theme.typography.weights.semibold,
  },
  error: {
    color: theme.colors.danger,
  },
  success: {
    color: theme.colors.successText,
    fontWeight: theme.typography.weights.bold,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    padding: 12,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
  },
});
