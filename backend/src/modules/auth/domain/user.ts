import type { UserId, UserRole } from "@qqs/contracts";

export type User = {
  id: UserId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
};

export class InvalidCredentialsError extends Error {
  constructor() {
    super("invalid credentials");
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super("invalid refresh token");
  }
}

export class TooManyLoginAttemptsError extends Error {
  constructor() {
    super("too many login attempts");
  }
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("email already registered");
  }
}

export class InvalidRegistrationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
