import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  updatedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  updatedText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.sm,
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  alertsList: {
    gap: theme.spacing.sm,
  },
  alertCard: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerBg,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  alertMessage: {
    color: theme.colors.danger,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  staffList: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  staffRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.surfaceTint,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  staffRowLast: {
    borderBottomWidth: 0,
  },
  staffInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  staffName: {
    color: theme.colors.text,
    flexShrink: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  staffStatusGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  activeVisitsText: {
    color: theme.colors.corporateBlue,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  expandButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceAlt,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingVertical: theme.spacing.sm,
  },
  expandText: {
    color: theme.colors.corporateBlue,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
});
