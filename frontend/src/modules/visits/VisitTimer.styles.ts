import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  timerCard: {
    backgroundColor: "#F0F7FD",
    borderColor: "#D2E4F5",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  timerCardCompleted: {
    backgroundColor: "#F0F9F8",
    borderColor: "#BDE2DF",
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
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  iconCircleCompleted: {
    backgroundColor: theme.colors.aqua,
  },
  timerLabel: {
    color: theme.colors.darkGray,
    fontSize: 14,
    fontWeight: "700",
  },
  timerSublabel: {
    color: "#555E68",
    fontSize: 12,
    marginTop: 1,
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "#E2F0FD",
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pulsingDot: {
    backgroundColor: "#27AE60",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  liveText: {
    color: theme.colors.corporateBlue,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeDisplayBox: {
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.lightBlue,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 12,
  },
  timeText: {
    color: theme.colors.corporateBlue,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
  timeTextCompleted: {
    color: theme.colors.darkGray,
  },
});
