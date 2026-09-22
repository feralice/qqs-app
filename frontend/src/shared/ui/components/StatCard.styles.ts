import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderColor: "#E2EEF8",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minWidth: 150,
    padding: theme.spacing.md,
    shadowColor: "#0876C9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconCircle: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  trendBadge: {
    alignItems: "center",
    backgroundColor: "#EAFAF1",
    borderRadius: 12,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendText: {
    color: "#1E8449",
    fontSize: 11,
    fontWeight: "700",
  },
  value: {
    color: theme.colors.darkGray,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  subtitle: {
    color: "#555E68",
    fontSize: 12,
    marginTop: 2,
  },
});
