import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },
  header: {
    backgroundColor: theme.colors.corporateBlue,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
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
    gap: 12,
  },
  logoCircle: {
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: theme.colors.lightBlue,
    fontSize: 12,
    fontWeight: "500",
  },
  userButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userTextWrap: {
    alignItems: "flex-end",
  },
  headerUser: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  headerRole: {
    color: theme.colors.lightBlue,
    fontSize: 11,
  },
  logoutIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  welcomeBox: {
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 24,
    fontWeight: "800",
  },
  description: {
    color: "#555E68",
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
});
