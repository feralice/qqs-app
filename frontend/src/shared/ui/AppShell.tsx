import { StyleSheet, Text, View } from "react-native";

import { theme } from "./theme.js";

export function AppShell() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QQS App</Text>
        <Text style={styles.headerSubtitle}>Visitas técnicas</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.description}>
          Acompanhe suas visitas e checklists mesmo sem internet.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    backgroundColor: theme.colors.corporateBlue,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
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
