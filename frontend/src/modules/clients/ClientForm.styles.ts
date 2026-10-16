import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  fieldGroup: {
    gap: 4,
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
  fieldError: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  systemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  systemText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
  },
  removeButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  removeButtonText: {
    color: theme.colors.danger,
    fontWeight: theme.typography.weights.semibold,
  },
  addSystemButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  addSystemButtonText: {
    color: theme.colors.corporateBlue,
    fontWeight: theme.typography.weights.bold,
  },
  generalError: {
    color: theme.colors.danger,
    fontWeight: theme.typography.weights.bold,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    padding: 14,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.weights.bold,
    textAlign: "center",
  },
});
