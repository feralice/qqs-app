import { createBrowserKeyValueStorage, type KeyValueStorage } from "./key-value-storage";

// expo-sqlite no web exige wasm e headers COOP/COEP; no navegador basta o localStorage.
export const deviceStorage: KeyValueStorage = createBrowserKeyValueStorage(
  typeof localStorage === "undefined" ? undefined : localStorage,
);
