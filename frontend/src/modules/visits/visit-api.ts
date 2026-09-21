import type {
  StartVisitRequest,
  StartVisitResponse,
  VisitDetails,
  VisitSummary,
} from "@qqs/contracts";

export type VisitApi = {
  listVisits(): Promise<VisitSummary[]>;
  getVisit(id: string): Promise<VisitDetails>;
  startVisit(id: string, request: StartVisitRequest): Promise<StartVisitResponse>;
};

export function createVisitApi(
  fetcher: typeof fetch = fetch,
  baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3333",
): VisitApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  }

  return {
    async listVisits() {
      const result = await request<{ items: VisitSummary[] }>("/visits");
      return result.items;
    },
    getVisit(id) {
      return request<VisitDetails>(`/visits/${id}`);
    },
    startVisit(id, body) {
      return request<StartVisitResponse>(`/visits/${id}/start`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  };
}
