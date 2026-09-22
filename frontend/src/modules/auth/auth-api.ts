import type { LoginRequest, LoginResponse, RefreshResponse, RegisterRequest, RegisterResponse } from "@qqs/contracts";

export type AuthApi = {
  login(request: LoginRequest): Promise<LoginResponse>;
  register(request: RegisterRequest): Promise<RegisterResponse>;
  refresh(refreshToken: string): Promise<RefreshResponse>;
  logout(refreshToken: string): Promise<void>;
};

export function getDefaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return "http://localhost:3333";
  }
  return "http://127.0.0.1:3333";
}

export function createAuthApi(
  fetcher: typeof fetch = fetch,
  baseUrl?: string,
): AuthApi {
  async function request<T>(path: string, body: unknown): Promise<T> {
    const activeBaseUrl = baseUrl ?? getDefaultApiUrl();
    const targetUrl = `${activeBaseUrl}${path}`;
    console.log("[AuthApi] Enviando requisição para:", targetUrl, body);
    try {
      const response = await fetcher(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.warn("[AuthApi] Resposta com erro:", response.status, data);
        throw new Error(data.error ?? `request failed: ${response.status}`);
      }
      if (response.status === 204) {
        return undefined as T;
      }
      const data = await response.json();
      console.log("[AuthApi] Sucesso na resposta:", data);
      return data as T;
    } catch (err) {
      console.error("[AuthApi] Erro na requisição (fetch):", targetUrl, err);
      throw err;
    }
  }

  return {
    login(body) {
      return request<LoginResponse>("/auth/login", body);
    },
    register(body) {
      return request<RegisterResponse>("/auth/register", body);
    },
    refresh(refreshToken) {
      return request<RefreshResponse>("/auth/refresh", { refreshToken });
    },
    async logout(refreshToken) {
      await request<void>("/auth/logout", { refreshToken });
    },
  };
}
