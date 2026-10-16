import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
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
    marginRight: theme.spacing.sm,
  },
  client: {
    color: theme.colors.text,
    flexShrink: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: -0.3,
  },
  badge: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
  },
  badgeAssigned: { backgroundColor: theme.colors.surfaceTint },
  badgeInProgress: { backgroundColor: theme.colors.surfaceTint },
  badgeDot: {
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.pill,
    height: 6,
    width: 6,
  },
  badgeDotInProgress: {
    backgroundColor: theme.colors.aqua,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  infoGroup: {
    gap: 6,
    marginTop: 14,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  outsideRadiusBadge: {
    alignSelf: "flex-start",
    marginTop: theme.spacing.sm,
  },
  syncBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surfaceTint,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 5,
    marginTop: theme.spacing.md,
    paddingHorizontal: 10,
    paddingVertical: theme.spacing.xs,
  },
  syncText: {
    color: theme.colors.corporateBlue,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
});
