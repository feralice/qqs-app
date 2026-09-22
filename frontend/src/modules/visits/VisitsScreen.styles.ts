import { StyleSheet } from "react-native";

import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  title: { color: theme.colors.darkGray, fontSize: 28, fontWeight: "700" },
  subtitle: { color: theme.colors.nearBlack, fontSize: 15, marginTop: 6 },
  list: { flexGrow: 1, paddingTop: theme.spacing.lg },
  emptyWrap: { alignItems: "center", flex: 1, justifyContent: "center", paddingTop: 60 },
  emptyTitle: { color: theme.colors.darkGray, fontSize: 17, fontWeight: "700" },
  emptyBody: { color: theme.colors.nearBlack, fontSize: 14, marginTop: 6, textAlign: "center" },
});
