import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 48,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: -0.3,
  },
  address: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    marginTop: theme.spacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.lightBlue,
    borderRadius: theme.radius.pill,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeInProgress: { backgroundColor: theme.colors.aqua },
  badgeCompleted: { backgroundColor: theme.colors.successBg },
  badgeText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  section: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginTop: theme.spacing.xl,
  },
  systemsCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginTop: 12,
    padding: theme.spacing.lg,
    elevation: 2,
  },
  systemRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.surfaceTint,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 12,
  },
  systemRowLast: { borderBottomWidth: 0 },
  systemDot: {
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.pill,
    height: 8,
    marginRight: 10,
    width: 8,
  },
  systemDotCompleted: {
    backgroundColor: theme.colors.success,
  },
  system: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  message: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    textAlign: "center",
  },
  arrivalButton: {
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.sm,
    minHeight: 44,
    marginTop: theme.spacing.xl,
  },
  finishButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.sm,
    minHeight: 44,
    marginTop: theme.spacing.xl,
  },
  mapButton: { marginTop: theme.spacing.md },
});
