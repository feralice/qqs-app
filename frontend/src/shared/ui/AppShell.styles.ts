import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.corporateBlue,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    elevation: 4,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  logoCircle: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  headerTitle: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: theme.colors.lightBlue,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  userButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userTextWrap: {
    alignItems: "flex-end",
  },
  headerUser: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  headerRole: {
    color: theme.colors.lightBlue,
    fontSize: theme.typography.sizes.xs,
  },
  logoutIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  welcomeBox: {
    padding: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
});
