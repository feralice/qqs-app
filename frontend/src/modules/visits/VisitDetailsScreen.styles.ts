import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 48,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  address: {
    color: "#555E68",
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.lightBlue,
    borderRadius: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeInProgress: { backgroundColor: theme.colors.aqua },
  badgeCompleted: { backgroundColor: "#D4EFDF" },
  badgeText: { color: theme.colors.nearBlack, fontSize: 12, fontWeight: "700" },
  section: {
    color: theme.colors.darkGray,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
  },
  systemsCard: {
    backgroundColor: theme.colors.white,
    borderColor: "#E2EEF8",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: theme.spacing.md,
    elevation: 2,
  },
  systemRow: {
    alignItems: "center",
    borderBottomColor: "#EBF3FA",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 12,
  },
  systemRowLast: { borderBottomWidth: 0 },
  systemDot: {
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: 999,
    height: 8,
    marginRight: 10,
    width: 8,
  },
  systemDotCompleted: {
    backgroundColor: "#27AE60",
  },
  system: { color: theme.colors.nearBlack, fontSize: 15, fontWeight: "500" },
  message: {
    backgroundColor: "#EBF5FC",
    borderColor: theme.colors.lightBlue,
    borderRadius: 12,
    borderWidth: 1,
    color: theme.colors.darkGray,
    fontSize: 14,
    fontWeight: "600",
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    textAlign: "center",
  },
  arrivalButton: {
    backgroundColor: theme.colors.corporateBlue,
    marginTop: 24,
  },
  finishButton: {
    backgroundColor: "#16A34A",
    marginTop: 24,
  },
  mapButton: { marginTop: theme.spacing.md },
});
