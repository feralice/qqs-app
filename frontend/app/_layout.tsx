import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../src/modules/auth/AuthContext";

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const firstSegment: string | undefined = segments[0];
    const onLoginScreen = firstSegment === "login";
    const onRegisterScreen = firstSegment === "register";
    const onAdminScreen = firstSegment === "admin";

    if (!user) {
      if (!onLoginScreen && !onRegisterScreen) router.replace("/login" as never);
      return;
    }

    if (onLoginScreen || onRegisterScreen) {
      router.replace((user.role === "supervisor" ? "/admin" : "/") as never);
      return;
    }

    // Admin e técnico têm áreas separadas dentro do mesmo app.
    if (user.role === "supervisor" && !onAdminScreen) {
      router.replace("/admin" as never);
      return;
    }
    if (user.role === "employee" && onAdminScreen) {
      router.replace("/" as never);
    }
  }, [user, loading, segments, router]);

  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
