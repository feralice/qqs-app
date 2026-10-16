import { StyleSheet } from "react-native";

import { theme } from "../theme";

export const PLACEHOLDER_COLOR = theme.colors.textSubtle;
const ERROR_COLOR = theme.colors.danger;

export const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.lg },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  inputRow: { position: "relative" },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  inputWithToggle: { paddingRight: 44 },
  inputFocused: { borderColor: theme.colors.corporateBlue },
  inputError: { borderColor: ERROR_COLOR },
  toggle: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    top: 0,
    width: 40,
  },
  error: {
    color: ERROR_COLOR,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
  },
});
