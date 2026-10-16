import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    marginTop: "auto",
    maxHeight: "85%",
    padding: theme.spacing.xl,
  },
  scrollContent: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
  },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.sm,
  },
  saveButton: {
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: 44,
    padding: 14,
  },
  saveButtonEnabled: {
    backgroundColor: theme.colors.corporateBlue,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.lightBlue,
  },
  saveText: {
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
