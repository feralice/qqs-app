import { z } from "zod";
import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, RegisterRequest } from "@qqs/contracts";

export const LoginBody = z.object({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
}) satisfies z.ZodType<LoginRequest>;

export const RegisterBody = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string().describe("Regras de força validadas no caso de uso."),
}) satisfies z.ZodType<RegisterRequest>;

export const RefreshBody = z.object({ refreshToken: z.string().min(1) }) satisfies z.ZodType<RefreshRequest>;
export const LogoutBody = RefreshBody.partial();

export const TokensSchema = z
  .object({ accessToken: z.string(), refreshToken: z.string() })
  .meta({ id: "Tokens" }) satisfies z.ZodType<RefreshResponse>;

export const SessionSchema = TokensSchema.extend({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["employee", "supervisor"]),
  }),
}).meta({ id: "Session" }) satisfies z.ZodType<LoginResponse>;
