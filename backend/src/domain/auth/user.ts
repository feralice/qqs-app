import type { UserId, UserRole } from "@qqs/contracts";

import { ConflictError, RateLimitedError, UnauthorizedError, ValidationError } from "../common/errors.js";

export type User = {
  id: UserId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
};

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("invalid credentials");
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super("invalid refresh token");
  }
}

export class TooManyLoginAttemptsError extends RateLimitedError {
  constructor() {
    super("too many login attempts, try again later");
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  constructor() {
    super("email already registered");
  }
}

export class InvalidRegistrationError extends ValidationError {}
