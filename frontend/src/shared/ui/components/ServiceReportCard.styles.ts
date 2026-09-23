import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.nearBlack,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 12,
    fontSize: 14,
    color: theme.colors.nearBlack,
    minHeight: 110,
    textAlignVertical: "top",
  },
  inputDisabled: {
    backgroundColor: "#F1F5F9",
    color: "#475569",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 12,
    color: "#94A3B8",
  },
});
