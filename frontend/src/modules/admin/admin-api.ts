import type { AdminDashboardSummary } from "@qqs/contracts";

import { getDefaultApiUrl } from "../auth/auth-api";

export type AdminHistoryItem = {
  id: string;
  clientId: string;
  clientName?: string;
  employeeId: string;
  status: string;
  scheduledFor?: string;
};

export type AdminApi = {
  getDashboard(date: string): Promise<AdminDashboardSummary>;
  getHistory(filters: { from: string; to: string; employeeId?: string; status?: string; clientId?: string }): Promise<{ items: AdminHistoryItem[]; total: number }>;
  rescheduleVisit(visitId: string, scheduledFor: string, operationId: string): Promise<void>;
  reassignVisit(visitId: string, employeeId: string, operationId: string): Promise<void>;
};

export function createAdminApi(accessToken?: string, fetcher: typeof fetch = fetch, baseUrl?: string): AdminApi {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(`${baseUrl ?? getDefaultApiUrl()}${path}`, {
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      ...init,
    });
    if (!response.ok) throw new Error(`request failed: ${response.status}`);
    return (await response.json()) as T;
  }

  return {
    getDashboard(date) {
      return request<AdminDashboardSummary>(`/admin/dashboard?date=${encodeURIComponent(date)}`);
    },
    getHistory(filters) {
      const query = new URLSearchParams(filters).toString();
      return request<{ items: AdminHistoryItem[]; total: number }>(`/admin/history?${query}`);
    },
    async rescheduleVisit(visitId, scheduledFor, operationId) {
      await request(`/admin/visits/${visitId}/reschedule`, { method: "POST", body: JSON.stringify({ scheduledFor, operationId }) });
    },
    async reassignVisit(visitId, employeeId, operationId) {
      await request(`/admin/visits/${visitId}/reassign`, { method: "POST", body: JSON.stringify({ employeeId, operationId }) });
    },
  };
}
