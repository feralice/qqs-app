import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AuthUser } from "@qqs/contracts";

// Cofre seguro do dispositivo (Keychain no iOS, Keystore no Android).
// Nunca guardar token em AsyncStorage puro: qualquer app no aparelho conseguiria ler.
// expo-secure-store não existe na web; ali usamos localStorage como equivalente de dev.
const store = Platform.OS === "web"
  ? {
      getItemAsync: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
      setItemAsync: async (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
      deleteItemAsync: async (key: string) => globalThis.localStorage?.removeItem(key),
    }
  : SecureStore;

const ACCESS_TOKEN_KEY = "qqs.accessToken";
const REFRESH_TOKEN_KEY = "qqs.refreshToken";
const USER_KEY = "qqs.user";

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export const tokenStorage = {
  async save(session: StoredSession): Promise<void> {
    await Promise.all([
      store.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken),
      store.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken),
      store.setItemAsync(USER_KEY, JSON.stringify(session.user)),
    ]);
  },

  async load(): Promise<StoredSession | undefined> {
    const [accessToken, refreshToken, userJson] = await Promise.all([
      store.getItemAsync(ACCESS_TOKEN_KEY),
      store.getItemAsync(REFRESH_TOKEN_KEY),
      store.getItemAsync(USER_KEY),
    ]);
    if (!accessToken || !refreshToken || !userJson) return undefined;
    return { accessToken, refreshToken, user: JSON.parse(userJson) as AuthUser };
  },

  async clear(): Promise<void> {
    await Promise.all([
      store.deleteItemAsync(ACCESS_TOKEN_KEY),
      store.deleteItemAsync(REFRESH_TOKEN_KEY),
      store.deleteItemAsync(USER_KEY),
    ]);
  },
};
