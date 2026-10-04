import type {
  CreateVisitRequest,
  CreateVisitResponse,
  EmployeeSummary,
  FinishVisitRequest,
  FinishVisitResponse,
  StartVisitRequest,
  StartVisitResponse,
  VisitDetails,
} from "@qqs/contracts";

export type VisitApi = {
  listVisits(): Promise<VisitDetails[]>;
  getVisit(id: string): Promise<VisitDetails>;
  startVisit(id: string, request: StartVisitRequest): Promise<StartVisitResponse>;
  finishVisit(id: string, request: FinishVisitRequest): Promise<FinishVisitResponse>;
  listEmployees(): Promise<EmployeeSummary[]>;
  createVisit(request: CreateVisitRequest): Promise<CreateVisitResponse>;
};

import { getDefaultApiUrl } from "../auth/auth-api";
import { ApiError } from "../../shared/http/api-error";

export function createVisitApi(
  accessToken?: string,
  fetcher: typeof fetch = fetch,
  baseUrl?: string,
): VisitApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const activeBaseUrl = baseUrl ?? getDefaultApiUrl();
    const response = await fetcher(`${activeBaseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...init,
    });
    if (!response.ok) {
      throw new ApiError(response.status);
    }
    return (await response.json()) as T;
  }

  return {
    async listVisits() {
      const result = await request<{ items: VisitDetails[] }>("/visits");
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
    finishVisit(id, body) {
      return request<FinishVisitResponse>(`/visits/${id}/finish`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    async listEmployees() {
      const result = await request<{ items: EmployeeSummary[] }>("/employees");
      return result.items;
    },
    createVisit(body) {
      return request<CreateVisitResponse>("/visits", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  };
}
