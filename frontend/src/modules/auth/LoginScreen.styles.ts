import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F0F7FD",
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: theme.spacing.lg * 1.5,
  },
  brand: {
    color: theme.colors.corporateBlue,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: "#555E68",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderColor: "#E1EEF8",
    borderRadius: 24,
    borderWidth: 1,
    padding: theme.spacing.lg * 1.2,
    shadowColor: "#0876C9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: theme.spacing.md,
  },
  error: {
    backgroundColor: "#FDEDEC",
    borderColor: "#FADBD8",
    borderRadius: 12,
    borderWidth: 1,
    color: "#C0392B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm + 4,
    textAlign: "center",
  },
  submitButton: { marginTop: theme.spacing.sm },
});
