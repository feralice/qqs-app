import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../modules/auth/AuthContext";
import { theme } from "./theme";
import { styles } from "./AppShell.styles";

export function AppShell({ children }: { children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>QQS App</Text>
            <Text style={styles.headerSubtitle}>Visitas técnicas</Text>
          </View>
          {user && (
            <Pressable accessibilityRole="button" onPress={logout}>
              <Text style={styles.headerUser}>{user.name}</Text>
              <Text style={styles.headerLogout}>Sair</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        {children ?? (
          <>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.description}>
              Acompanhe suas visitas e checklists mesmo sem internet.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
