import { StyleSheet } from "react-native";

import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  headerArea: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: { color: "#555E68", fontSize: 14, marginTop: 2 },
  countBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.lightBlue,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: theme.colors.corporateBlue,
    fontSize: 14,
    fontWeight: "700",
  },
  list: { flexGrow: 1, paddingTop: 4 },
  emptyWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.lightBlue,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    marginTop: 40,
    padding: theme.spacing.lg * 1.5,
  },
  emptyIconCircle: {
    alignItems: "center",
    backgroundColor: "#F0F7FD",
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    marginBottom: 16,
    width: 64,
  },
  emptyTitle: { color: theme.colors.darkGray, fontSize: 18, fontWeight: "700" },
  emptyBody: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
});
