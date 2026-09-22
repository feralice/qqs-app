import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#555E68",
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: theme.colors.darkGray,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  moduleCard: {
    backgroundColor: theme.colors.white,
    borderColor: "#E2EEF8",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: "#0876C9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  moduleHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  moduleIconWrap: {
    alignItems: "center",
    backgroundColor: "#F0F7FD",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  moduleTextWrap: {
    flex: 1,
  },
  moduleTitle: {
    color: theme.colors.darkGray,
    fontSize: 16,
    fontWeight: "700",
  },
  moduleBody: {
    color: "#555E68",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  moduleFooter: {
    alignItems: "center",
    borderTopColor: "#F0F7FD",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
  },
});
