import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
          <View style={styles.brandGroup}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark-sharp" size={20} color={theme.colors.corporateBlue} />
            </View>
            <View>
              <Text style={styles.headerTitle}>QQS App</Text>
              <Text style={styles.headerSubtitle}>Visitas Técnicas</Text>
            </View>
          </View>
          {user && (
            <Pressable accessibilityRole="button" onPress={logout} style={styles.userButton}>
              <View style={styles.userTextWrap}>
                <Text style={styles.headerUser}>{user.name}</Text>
                <Text style={styles.headerRole}>
                  {user.role === "supervisor" ? "Supervisor" : "Técnico"}
                </Text>
              </View>
              <View style={styles.logoutIcon}>
                <Ionicons name="log-out-outline" size={18} color={theme.colors.white} />
              </View>
            </Pressable>
          )}
        </View>
      </View>
      <View style={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        {children ?? (
          <View style={styles.welcomeBox}>
            <Text style={styles.title}>Bem-vindo ao QQS App</Text>
            <Text style={styles.description}>
              Gerencie suas visitas técnicas e checklists em tempo real com operação offline.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
