import { StyleSheet } from "react-native";

import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  row: { alignItems: "flex-start", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  client: { color: theme.colors.darkGray, flexShrink: 1, fontSize: 17, fontWeight: "700" },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAssigned: { backgroundColor: theme.colors.lightBlue },
  badgeInProgress: { backgroundColor: theme.colors.aqua },
  badgeText: { color: theme.colors.nearBlack, fontSize: 11, fontWeight: "700" },
  meta: { color: theme.colors.nearBlack, fontSize: 14, marginTop: 8 },
  sync: { color: theme.colors.corporateBlue, fontSize: 12, fontWeight: "700", marginTop: 10 },
});
