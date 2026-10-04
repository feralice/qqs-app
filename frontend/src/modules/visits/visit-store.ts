import type { VisitDetails } from "@qqs/contracts";

import type { KeyValueStorage } from "../sync/key-value-storage";

export class VisitStore {
  private readonly visits = new Map<string, VisitDetails>();

  constructor(
    private readonly storage?: KeyValueStorage,
    private readonly storageKey = "visits",
  ) {}

  static async open(storage: KeyValueStorage, storageKey = "visits"): Promise<VisitStore> {
    const store = new VisitStore(storage, storageKey);
    const raw = await storage.getItem(storageKey);
    for (const visit of raw ? (JSON.parse(raw) as VisitDetails[]) : []) {
      store.visits.set(visit.id, visit);
    }
    return store;
  }

  private async persist(): Promise<void> {
    await this.storage?.setItem(this.storageKey, JSON.stringify([...this.visits.values()]));
  }

  async set(visit: VisitDetails): Promise<void> {
    this.visits.set(visit.id, visit);
    await this.persist();
  }

  // Lista do servidor substitui o cache, menos as visitas que ainda têm operação na fila.
  async setAll(items: VisitDetails[], unsyncedIds: Iterable<string> = []): Promise<void> {
    const keep = new Set(unsyncedIds);
    const pendingLocal = [...this.visits.values()].filter((visit) => keep.has(visit.id));
    this.visits.clear();
    for (const item of items) {
      this.visits.set(item.id, { ...item, syncStatus: "synced" });
    }
    for (const visit of pendingLocal) {
      this.visits.set(visit.id, visit);
    }
    await this.persist();
  }

  get(id: string): VisitDetails | undefined {
    return this.visits.get(id);
  }

  list(): VisitDetails[] {
    return [...this.visits.values()];
  }
}
