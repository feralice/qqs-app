import type {
  AddClientSystemRequest,
  ClientSummary,
  CreateClientRequest,
  UpdateClientRequest,
} from "@qqs/contracts";

import { getDefaultApiUrl } from "../auth/auth-api";
import { ApiError } from "../../shared/http/api-error";

export type ClientApi = {
  listClients(options?: { q?: string; includeInactive?: boolean }): Promise<ClientSummary[]>;
  createClient(request: CreateClientRequest): Promise<ClientSummary>;
  updateClient(id: string, request: UpdateClientRequest): Promise<ClientSummary>;
  addSystem(id: string, request: AddClientSystemRequest): Promise<ClientSummary>;
};

export function createClientApi(accessToken?: string, fetcher: typeof fetch = fetch, baseUrl?: string): ClientApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(`${baseUrl ?? getDefaultApiUrl()}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...init,
    });
    if (!response.ok) throw new ApiError(response.status);
    return (await response.json()) as T;
  }

  return {
    async listClients(options = {}) {
      const query = new URLSearchParams();
      if (options.q) query.set("q", options.q);
      if (options.includeInactive) query.set("includeInactive", "true");
      const suffix = query.size ? `?${query.toString()}` : "";
      return (await request<{ items: ClientSummary[] }>(`/clients${suffix}`)).items;
    },
    createClient(body) {
      return request<ClientSummary>("/clients", { method: "POST", body: JSON.stringify(body) });
    },
    updateClient(id, body) {
      return request<ClientSummary>(`/clients/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(body) });
    },
    addSystem(id, body) {
      return request<ClientSummary>(`/clients/${encodeURIComponent(id)}/systems`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  };
}
