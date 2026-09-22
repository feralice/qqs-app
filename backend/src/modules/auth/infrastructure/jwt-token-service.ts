import jwt from "jsonwebtoken";

import type { AccessTokenPayload, TokenService } from "../application/ports.js";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
  }

  verifyAccessToken(token: string): AccessTokenPayload | undefined {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded !== "object" || !decoded.sub || !decoded.role) {
        return undefined;
      }
      return { sub: decoded.sub as string, role: decoded.role as AccessTokenPayload["role"] };
    } catch {
      return undefined;
    }
  }
}
