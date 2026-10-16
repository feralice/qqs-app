import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.lg,
    elevation: 2,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  trendBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.successBg,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  trendText: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: -0.5,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginTop: theme.spacing.xxs,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xxs,
  },
});
