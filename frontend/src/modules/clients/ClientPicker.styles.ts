import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  searchInput: {
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
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    minHeight: 44,
    padding: 12,
  },
  itemCardSelected: {
    backgroundColor: theme.colors.surfaceTint,
    borderColor: theme.colors.corporateBlue,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  itemAddress: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    marginTop: 2,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
  },
});
