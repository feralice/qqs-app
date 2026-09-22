import { StyleSheet } from "react-native";

import { theme } from "../theme";

export const PLACEHOLDER_COLOR = "#8A8F98";
const ERROR_COLOR = "#C0392B";

export const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { color: theme.colors.darkGray, fontSize: 14, fontWeight: "700", marginBottom: 6 },
  inputRow: { position: "relative" },
  input: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.lightBlue,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    color: theme.colors.nearBlack,
    fontSize: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
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
  error: { color: ERROR_COLOR, fontSize: 13, marginTop: 4 },
});
