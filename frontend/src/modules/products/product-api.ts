import type {
  ClientProgram,
  CreateProductRequest,
  Product,
  SystemProgram,
  UpdateProductRequest,
  UpdateSystemProgramRequest,
} from "@qqs/contracts";

import { getDefaultApiUrl } from "../auth/auth-api";
import { ApiError } from "../../shared/http/api-error";

export type ProductApi = {
  listProducts(options?: { includeInactive?: boolean }): Promise<Product[]>;
  createProduct(request: CreateProductRequest): Promise<Product>;
  updateProduct(id: string, request: UpdateProductRequest): Promise<Product>;
  getClientProgram(clientId: string): Promise<ClientProgram>;
  saveSystemProgram(clientId: string, systemId: string, request: UpdateSystemProgramRequest): Promise<SystemProgram>;
};

export function createProductApi(accessToken?: string, fetcher: typeof fetch = fetch, baseUrl?: string): ProductApi {
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

  const send = <T>(path: string, method: string, body: unknown) =>
    request<T>(path, { method, body: JSON.stringify(body) });

  return {
    async listProducts(options = {}) {
      const suffix = options.includeInactive ? "?includeInactive=true" : "";
      return (await request<{ items: Product[] }>(`/products${suffix}`)).items;
    },
    createProduct: (body) => send("/products", "POST", body),
    updateProduct: (id, body) => send(`/products/${encodeURIComponent(id)}`, "PATCH", body),
    getClientProgram: (clientId) => request(`/clients/${encodeURIComponent(clientId)}/program`),
    saveSystemProgram: (clientId, systemId, body) =>
      send(`/clients/${encodeURIComponent(clientId)}/systems/${encodeURIComponent(systemId)}/program`, "PUT", body),
  };
}
