import type { RefreshTokenRepository } from "./ports.js";

export type LogoutInput = {
  refreshToken: string;
};

export async function logout(
  deps: { refreshTokens: RefreshTokenRepository },
  input: LogoutInput,
): Promise<void> {
  await deps.refreshTokens.revoke(input.refreshToken);
}
