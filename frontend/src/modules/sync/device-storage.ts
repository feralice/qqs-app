import Storage from "expo-sqlite/kv-store";

import type { KeyValueStorage } from "./key-value-storage";

export const deviceStorage: KeyValueStorage = Storage;
