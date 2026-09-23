const memoryStore = new Map();

module.exports = {
  getItemAsync: async (k) => memoryStore.get(k) ?? null,
  setItemAsync: async (k, v) => {
    memoryStore.set(k, v);
  },
  deleteItemAsync: async (k) => {
    memoryStore.delete(k);
  },
};
