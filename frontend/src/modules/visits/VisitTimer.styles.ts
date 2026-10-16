import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  timerCard: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  timerCardCompleted: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
  },
  timerHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timerIconGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  iconCircleCompleted: {
    backgroundColor: theme.colors.aqua,
  },
  timerLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  timerSublabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    marginTop: 1,
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceTint,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pulsingDot: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.pill,
    height: 7,
    width: 7,
  },
  liveText: {
    color: theme.colors.corporateBlue,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  timeDisplayBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  timeText: {
    color: theme.colors.corporateBlue,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1,
  },
  timeTextCompleted: {
    color: theme.colors.text,
  },
});
