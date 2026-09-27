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
