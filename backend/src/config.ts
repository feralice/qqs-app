export type ServerConfig = {
  port: number;
  host: string;
  databaseUrl?: string;
  pgliteDataDir: string;
  jwtSecret?: string;
  seedDevelopmentData: boolean;
};

// Contas de teste têm senha conhecida: só entram no banco local (PGlite) ou com opt-in explícito.
export function loadServerConfig(env: Record<string, string | undefined>): ServerConfig {
  const databaseUrl = env.DATABASE_URL || undefined;
  if (databaseUrl && !env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set when DATABASE_URL is used");
  }
  const production = env.NODE_ENV === "production";
  return {
    port: Number(env.PORT ?? 3333),
    host: env.HOST ?? "0.0.0.0",
    databaseUrl,
    pgliteDataDir: env.PGLITE_DATA_DIR ?? ".data/pglite",
    jwtSecret: env.JWT_SECRET,
    seedDevelopmentData: !production && (!databaseUrl || env.SEED_DEV_DATA === "true"),
  };
}
