import type { KeyValueStorage } from "./key-value-storage";

export type LocalCache<T> = {
  read(key: string): Promise<T | undefined>;
  write(key: string, value: T): Promise<void>;
  remove?(key: string): Promise<void>;
};

export function createMemoryLocalCache<T>(): LocalCache<T> {
  const values = new Map<string, T>();
  return {
    async read(key) {
      return values.get(key);
    },
    async write(key, value) {
      values.set(key, value);
    },
    async remove(key) {
      values.delete(key);
    },
  };
}

export function createPersistentLocalCache<T>(storage: KeyValueStorage, namespace: string): LocalCache<T> {
  const keyFor = (key: string) => `${namespace}:${key}`;
  return {
    async read(key) {
      const raw = await storage.getItem(keyFor(key));
      if (raw === null) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return undefined;
      }
    },
    async write(key, value) {
      await storage.setItem(keyFor(key), JSON.stringify(value));
    },
    async remove(key) {
      await storage.removeItem(keyFor(key));
    },
  };
}
