import { StyleSheet } from "react-native";

import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  title: { color: theme.colors.darkGray, fontSize: 28, fontWeight: "700" },
  subtitle: { color: theme.colors.nearBlack, fontSize: 15, marginTop: 6 },
  sectionLabel: {
    color: theme.colors.corporateBlue,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: theme.spacing.lg,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: theme.colors.white,
    borderLeftColor: theme.colors.aqua,
    borderLeftWidth: 4,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { color: theme.colors.darkGray, fontSize: 16, fontWeight: "700" },
  cardBody: { color: theme.colors.nearBlack, fontSize: 14, marginTop: 6 },
  cardTag: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.lightBlue,
    borderRadius: 999,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  cardTagText: { color: theme.colors.corporateBlue, fontSize: 11, fontWeight: "700" },
});
