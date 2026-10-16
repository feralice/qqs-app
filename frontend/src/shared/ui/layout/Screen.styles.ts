import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
});
