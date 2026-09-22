import { StyleSheet } from "react-native";

import { theme } from "./theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    backgroundColor: theme.colors.corporateBlue,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: theme.colors.lightBlue,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  headerUser: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  headerLogout: {
    color: theme.colors.lightBlue,
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },
  content: {
    backgroundColor: theme.colors.lightBlue,
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    color: theme.colors.nearBlack,
    fontSize: 16,
    marginTop: theme.spacing.sm,
  },
});
