import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderColor: "#E2EEF8",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md + 2,
    shadowColor: "#0876C9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clientTitleGroup: {
    alignItems: "flex-start",
    flex: 1,
    gap: 6,
  },
  client: {
    color: theme.colors.darkGray,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  badge: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAssigned: { backgroundColor: "#EBF5FC" },
  badgeInProgress: { backgroundColor: "#E6F5F5" },
  badgeDot: {
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  badgeDotInProgress: {
    backgroundColor: theme.colors.aqua,
  },
  badgeText: {
    color: theme.colors.nearBlack,
    fontSize: 12,
    fontWeight: "600",
  },
  infoGroup: {
    gap: 6,
    marginTop: 14,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  metaText: {
    color: "#555E68",
    fontSize: 14,
    fontWeight: "500",
  },
  syncBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F0F7FD",
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  syncText: {
    color: theme.colors.corporateBlue,
    fontSize: 12,
    fontWeight: "600",
  },
});
