import type { VisitDetails, VisitSummary } from "@qqs/contracts";

export class VisitStore {
  private readonly visits = new Map<string, VisitDetails>();

  set(visit: VisitDetails): void {
    this.visits.set(visit.id, visit);
  }

  setSummaries(items: VisitSummary[]): void {
    for (const item of items) {
      const current = this.visits.get(item.id);
      this.visits.set(item.id, {
        ...current,
        ...item,
        systems: current?.systems ?? [],
        syncStatus: current?.syncStatus ?? "pending",
      });
    }
  }

  get(id: string): VisitDetails | undefined {
    return this.visits.get(id);
  }

  list(): VisitDetails[] {
    return [...this.visits.values()];
  }
}
