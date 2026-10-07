// Erros de aplicação carregam uma categoria, não um status HTTP: a camada de
// apresentação decide o código (ver shared/http/error-handler.ts).
export type ErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unprocessable"
  | "rate_limited";

export abstract class AppError extends Error {
  abstract readonly kind: ErrorKind;

  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  readonly kind = "validation";
}

export class UnauthorizedError extends AppError {
  readonly kind = "unauthorized";
}

export class ForbiddenError extends AppError {
  readonly kind = "forbidden";
}

export class NotFoundError extends AppError {
  readonly kind = "not_found";
}

export class ConflictError extends AppError {
  readonly kind = "conflict";
}

export class UnprocessableError extends AppError {
  readonly kind = "unprocessable";
}

export class RateLimitedError extends AppError {
  readonly kind = "rate_limited";
}
