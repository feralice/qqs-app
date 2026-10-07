import type { ApiRouter } from "../../http/api-router.js";
import { ErrorSchema, errorResponses } from "../../http/schemas.js";
import { login } from "../../../application/auth/commands/login.js";
import { logout } from "../../../application/auth/commands/logout.js";
import type { PasswordHasher, RefreshTokenRepository, TokenService, UserRepository } from "../../../application/auth/ports.js";
import { refresh } from "../../../application/auth/commands/refresh.js";
import { register } from "../../../application/auth/commands/register.js";
import { InvalidCredentialsError, TooManyLoginAttemptsError } from "../../../domain/auth/user.js";
import type { LoginRateLimiter } from "../../../infrastructure/security/login-rate-limiter.js";
import { LoginBody, LogoutBody, RefreshBody, RegisterBody, SessionSchema, TokensSchema } from "./auth-schemas.js";

const tag = "Autenticação";

export type AuthRouteDeps = {
  users: UserRepository;
  hasher: PasswordHasher;
  tokens: TokenService;
  refreshTokens: RefreshTokenRepository;
  rateLimiter: LoginRateLimiter;
};

export function registerAuthRoutes(api: ApiRouter, deps: AuthRouteDeps): void {
  api.route(
    {
      method: "post",
      path: "/auth/login",
      tag,
      access: "public",
      summary: "Login por e-mail e senha (RF-001, RF-002).",
      description: "Após 5 falhas seguidas o e-mail fica bloqueado por 15 minutos.",
      body: LoginBody,
      responses: {
        200: { description: "Sessão criada.", schema: SessionSchema },
        400: errorResponses.validation,
        401: { description: "Credenciais inválidas.", schema: ErrorSchema },
        429: { description: "Muitas tentativas.", schema: ErrorSchema },
      },
    },
    async ({ body }, response) => {
      if (deps.rateLimiter.isLocked(body.email)) throw new TooManyLoginAttemptsError();
      try {
        const session = await login(deps, body);
        deps.rateLimiter.registerSuccess(body.email);
        response.json(session);
      } catch (error) {
        if (error instanceof InvalidCredentialsError) deps.rateLimiter.registerFailure(body.email);
        throw error;
      }
    },
  );

  api.route(
    {
      method: "post",
      path: "/auth/register",
      tag,
      access: "public",
      summary: "Cadastro de técnico.",
      body: RegisterBody,
      responses: {
        201: { description: "Conta criada e sessão iniciada.", schema: SessionSchema },
        400: errorResponses.validation,
        409: { description: "E-mail já cadastrado.", schema: ErrorSchema },
      },
    },
    async ({ body }, response) => {
      response.status(201).json(await register(deps, body));
    },
  );

  api.route(
    {
      method: "post",
      path: "/auth/refresh",
      tag,
      access: "public",
      summary: "Troca o refresh token por um novo par de tokens (rotação).",
      body: RefreshBody,
      responses: {
        200: { description: "Novos tokens.", schema: TokensSchema },
        400: errorResponses.validation,
        401: { description: "Refresh token inválido, expirado ou revogado.", schema: ErrorSchema },
      },
    },
    async ({ body }, response) => {
      response.json(await refresh(deps, body));
    },
  );

  api.route(
    {
      method: "post",
      path: "/auth/logout",
      tag,
      access: "public",
      summary: "Revoga o refresh token.",
      body: LogoutBody,
      responses: { 204: { description: "Sessão encerrada." } },
    },
    async ({ body }, response) => {
      if (body.refreshToken) await logout(deps, { refreshToken: body.refreshToken });
      response.status(204).send();
    },
  );
}
