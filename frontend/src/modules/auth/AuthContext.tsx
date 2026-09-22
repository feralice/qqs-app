import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, LoginResponse } from "@qqs/contracts";

import { createAuthApi, type AuthApi } from "./auth-api";
import { tokenStorage } from "./token-storage";

type AuthState = {
  user?: AuthUser;
  accessToken?: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({
  children,
  api = createAuthApi(),
}: {
  children: ReactNode;
  api?: AuthApi;
}) {
  const [user, setUser] = useState<AuthUser>();
  const [accessToken, setAccessToken] = useState<string>();
  const [refreshToken, setRefreshToken] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenStorage.load().then((session) => {
      if (session) {
        setUser(session.user);
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
      }
      setLoading(false);
    });
  }, []);

  async function applySession(session: LoginResponse) {
    setUser(session.user);
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    await tokenStorage.save(session);
  }

  async function login(email: string, password: string) {
    await applySession(await api.login({ email, password }));
  }

  async function register(name: string, email: string, password: string) {
    await applySession(await api.register({ name, email, password }));
  }

  async function logout() {
    if (refreshToken) {
      await api.logout(refreshToken).catch(() => undefined);
    }
    setUser(undefined);
    setAccessToken(undefined);
    setRefreshToken(undefined);
    await tokenStorage.clear();
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
