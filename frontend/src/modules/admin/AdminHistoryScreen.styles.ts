import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  offlineNotice: {
    color: theme.colors.warning,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  filterInput: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 4,
    minHeight: 44,
    padding: theme.spacing.lg,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  itemStatus: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
  },
  itemDate: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.xs,
  },
});
