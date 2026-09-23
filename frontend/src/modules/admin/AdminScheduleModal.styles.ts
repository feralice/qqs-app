import { StyleSheet } from "react-native";
import { theme } from "../../shared/ui/theme";

export const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    maxHeight: "90%",
    padding: theme.spacing.lg,
    elevation: 5,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: theme.colors.darkGray,
    fontSize: 20,
    fontWeight: "800",
  },
  closeButton: {
    padding: 6,
  },
  subtitle: {
    color: "#555E68",
    fontSize: 13,
    marginBottom: theme.spacing.md,
  },
  formScroll: {
    paddingBottom: 20,
  },
  label: {
    color: theme.colors.darkGray,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2EEF8",
    borderRadius: 12,
    borderWidth: 1,
    color: theme.colors.nearBlack,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  employeeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  employeeChip: {
    backgroundColor: "#F0F7FD",
    borderColor: theme.colors.lightBlue,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  employeeChipSelected: {
    backgroundColor: theme.colors.corporateBlue,
    borderColor: theme.colors.corporateBlue,
  },
  employeeChipText: {
    color: theme.colors.corporateBlue,
    fontSize: 13,
    fontWeight: "600",
  },
  employeeChipTextSelected: {
    color: theme.colors.white,
  },
  systemAddRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  systemAddInput: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2EEF8",
    borderRadius: 12,
    borderWidth: 1,
    color: theme.colors.nearBlack,
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addSystemButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  addSystemButtonText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  systemsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  systemItem: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  systemItemText: {
    color: theme.colors.darkGray,
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    alignItems: "center",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
