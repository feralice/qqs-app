import { StyleSheet } from "react-native";
import { theme } from "../theme";

export const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 20,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  info: { backgroundColor: "#EBF5FC" },
  success: { backgroundColor: "#EAFAF1" },
  warning: { backgroundColor: "#FEF9E7" },
  danger: { backgroundColor: "#FDEDEC" },
  neutral: { backgroundColor: "#F2F4F4" },

  dot: {
    borderRadius: 999,
    height: 6,
    marginRight: 6,
    width: 6,
  },
  infoDot: { backgroundColor: theme.colors.corporateBlue },
  successDot: { backgroundColor: "#27AE60" },
  warningDot: { backgroundColor: "#F39C12" },
  dangerDot: { backgroundColor: "#E74C3C" },
  neutralDot: { backgroundColor: theme.colors.darkGray },

  text: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoText: { color: theme.colors.corporateBlue },
  successText: { color: "#1E8449" },
  warningText: { color: "#B9770E" },
  dangerText: { color: "#A93226" },
  neutralText: { color: theme.colors.darkGray },
});
