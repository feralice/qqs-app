import { StyleSheet } from "react-native";

import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg },
  title: { color: theme.colors.darkGray, fontSize: 26, fontWeight: "700" },
  address: { color: theme.colors.nearBlack, marginTop: 6 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.lightBlue,
    borderRadius: 999,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeInProgress: { backgroundColor: theme.colors.aqua },
  badgeText: { color: theme.colors.nearBlack, fontSize: 11, fontWeight: "700" },
  section: { color: theme.colors.darkGray, fontSize: 18, fontWeight: "700", marginTop: 28 },
  systemsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    marginTop: 12,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  systemRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.lightBlue,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 10,
  },
  systemRowLast: { borderBottomWidth: 0 },
  systemDot: {
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: 4,
    height: 8,
    marginRight: 10,
    width: 8,
  },
  system: { color: theme.colors.nearBlack, fontSize: 16 },
  message: {
    backgroundColor: theme.colors.lightBlue,
    borderRadius: theme.radius.md,
    color: theme.colors.darkGray,
    fontWeight: "600",
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  arrivalButton: { marginTop: 28 },
  mapButton: { marginTop: theme.spacing.md },
});
