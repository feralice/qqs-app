import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.nearBlack,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.lightBlue,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.corporateBlue,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayCol: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  dayColSelected: {
    backgroundColor: theme.colors.corporateBlue,
  },
  dayColToday: {
    borderWidth: 1,
    borderColor: theme.colors.corporateBlue,
  },
  dayOfWeek: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dayOfWeekSelected: {
    color: theme.colors.white,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.nearBlack,
  },
  dayNumberSelected: {
    color: theme.colors.white,
  },
  countBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: theme.colors.aqua,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  countBadgeSelected: {
    backgroundColor: theme.colors.white,
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.white,
  },
  countTextSelected: {
    color: theme.colors.corporateBlue,
  },
});
