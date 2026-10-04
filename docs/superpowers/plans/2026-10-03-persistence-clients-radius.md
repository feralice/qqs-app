# Persistência, Empresas e Validação de Raio: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tirar o QQS App do estado "tudo em memória": dados oficiais em PostgreSQL via Drizzle, dados de campo gravados no aparelho, cadastro de empresas com coordenadas e raio, e check-in que exige justificativa fora do raio.

**Architecture:** O backend ganha uma camada `shared/db` com um tipo `Database` comum a dois drivers Drizzle: `node-postgres` quando há `DATABASE_URL`, e PGlite (Postgres em WASM) para testes e para desenvolvimento sem Docker. Os módulos `auth`, `clients` e `visits` recebem repositórios Drizzle que implementam as portas já existentes. No mobile, uma porta `KeyValueStorage` (implementada por `expo-sqlite/kv-store`) persiste a fila de sincronização e o cache de visitas e empresas; a distância até o cliente é calculada no aparelho, para que a regra de raio funcione offline.

**Tech Stack:** Express 5, TypeScript, Drizzle ORM 0.44, drizzle-kit, `pg`, `@electric-sql/pglite` 0.5, Expo 57, React Native 0.86, `expo-sqlite` 57 (`kv-store`), `node:test`.

**Spec:** `docs/requisitos/RS-001-qqs-app-v0.2.md` (RF-005 a RF-008, RF-012, RF-014 a RF-016, RF-034, RF-039 a RF-044, RNF-005, RNF-010) e `docs/arquitetura/ARQ-001-qqs-app.md`.

## Global Constraints

- Backend: monólito modular, regra de negócio sem depender de Express nem Drizzle (RNF-004); repositórios implementam portas da camada `application`.
- Persistência oficial: PostgreSQL 16 via Drizzle, migrações SQL versionadas em `backend/drizzle/` (RNF-005, ARQ-001).
- Identificadores gerados no dispositivo são aceitos pelo backend; retentativas não podem duplicar visitas (RF-042, RF-044).
- Raio: distância acima de `radiusMeters` exige justificativa; a visita segue liberada mas marcada (RF-016).
- Mobile: imports relativos sem extensão `.js` (convenção do commit 7b46d2f); `@qqs/contracts` é consumido como fonte TS, então nada de imports relativos dentro de `packages/contracts/src/index.ts`.
- Backend: imports relativos com `.js` (NodeNext).
- Paleta do tema existente (`frontend/src/shared/ui/theme.ts`); nenhuma cor nova fora dela.
- Textos de interface em português.
- Contas de desenvolvimento só são semeadas fora de `NODE_ENV=production`.

## Review Focus

1. **Check-in sem GPS** (permissão negada ou sinal indisponível): a distância é desconhecida; o app deve tratar como fora do raio, pedir justificativa e marcar a visita. Teste no Task 5 (backend) e no Task 8 (mobile).
2. **App fechado no meio de uma sincronização**: operação gravada como `syncing` precisa voltar a ser reenviada ao reabrir o app, nunca ficar presa. Teste no Task 6.
3. **Fila com operações dependentes** (`visit.start` falha, `visit.finish` atrás dela): a fila deve parar na primeira falha e preservar a ordem, senão o servidor recebe um check-out de visita que nunca começou. Teste no Task 6.
4. **Reenvio da mesma visita criada offline** (`POST /visits` com o mesmo `id` duas vezes): segunda chamada devolve a visita existente sem duplicar. Teste no Task 5.
5. **CNPJ digitado com máscara ou com dígito verificador errado**: `12.345.678/0001-95` e `12345678000195` são o mesmo CNPJ; dígito errado é rejeitado com 400. Teste no Task 4.

---

## File Structure

```
packages/contracts/src/index.ts               # + GeoPoint, distanceMeters, tipos de empresa, campos de raio
backend/
  drizzle/0000_*.sql                          # migração regenerada (schema novo)
  src/shared/db/schema.ts                     # users, refresh_tokens, clients, client_systems, visits
  src/shared/db/database.ts                   # openDatabase(): Database migrado (pg ou PGlite)
  src/shared/db/test-database.ts              # createTestDatabase(): PGlite único por processo + TRUNCATE
  src/shared/db/seed.ts                       # seedDevelopmentData(db)
  src/test-support/http.ts                    # call(), login(), createTestApp()
  src/app.ts                                  # createApp({ db, jwtSecret })
  src/server.ts                               # abre banco, semeia em dev, sobe HTTP
  src/modules/auth/infrastructure/drizzle-user-repository.ts
  src/modules/auth/infrastructure/drizzle-refresh-token-repository.ts
  src/modules/clients/domain/client.ts        # erros de domínio
  src/modules/clients/domain/cnpj.ts          # normalizeCnpj, isValidCnpj
  src/modules/clients/application/ports.ts    # ClientRepository
  src/modules/clients/application/client-use-cases.ts
  src/modules/clients/infrastructure/drizzle-client-repository.ts
  src/modules/clients/presentation/client-routes.ts
  src/modules/visits/infrastructure/drizzle-visit-repository.ts
  src/modules/visits/application/start-visit.ts    # + regra de raio
frontend/
  mock-sqlite-kv.cjs                          # mock de expo-sqlite/kv-store nos testes
  src/modules/sync/key-value-storage.ts       # porta + memória
  src/modules/sync/device-storage.ts          # expo-sqlite/kv-store
  src/modules/sync/local-cache.ts             # + createPersistentLocalCache
  src/modules/sync/sync-queue.ts              # async, persistente, para na 1ª falha
  src/modules/sync/sync-runner.ts             # processa visit.create/start/finish
  src/modules/sync/DeviceDataContext.tsx      # abre fila + store uma vez
  src/modules/sync/local-id.ts                # UUID v4 no aparelho
  src/modules/visits/visit-store.ts           # persistente
  src/modules/visits/arrival.ts               # evaluateArrival()
  src/modules/visits/ArrivalJustification.tsx
  src/modules/clients/client-api.ts
  src/modules/clients/ClientPicker.tsx
  src/modules/clients/ClientsScreen.tsx
  src/modules/clients/ClientForm.tsx
  app/index.tsx, app/visit/[id].tsx, app/admin/index.tsx, app/admin/clients.tsx, app/_layout.tsx
```

---

### Task 1: Contratos de geolocalização e empresa

**Files:**
- Modify: `packages/contracts/src/index.ts`
- Test: `packages/contracts/src/geo.test.ts`

**Interfaces:**
- Produces:
  - `type GeoPoint = { latitude: number; longitude: number }`
  - `distanceMeters(a: GeoPoint, b: GeoPoint): number` (haversine, raio 6 371 000 m, arredondado para metro inteiro)
  - `type ClientLocation = GeoPoint & { radiusMeters: number }`
  - `type ClientSystem = { id: string; clientId: ClientId; name: string; type: string }`
  - `type ClientSummary = { id; name; cnpj; address; latitude; longitude; radiusMeters; active: boolean; systems: ClientSystem[] }`
  - `type CreateClientRequest = { id?: ClientId; name: string; cnpj: string; address: string; latitude: number; longitude: number; radiusMeters: number; systems?: Array<{ name: string; type: string }> }`
  - `type UpdateClientRequest = Partial<Omit<CreateClientRequest, "id" | "systems">> & { active?: boolean }`
  - `type AddClientSystemRequest = { name: string; type: string }`
  - `VisitArrival = { arrivedAt; location?; distanceMeters?; outsideRadius?: boolean; justification?: string }`
  - `VisitDetails` ganha `clientLocation?: ClientLocation` e `arrival?: VisitArrival`
  - `StartVisitRequest` ganha `justification?: string`
  - `CreateVisitRequest = { id?: VisitId; clientId: ClientId; employeeId?: UserId; scheduledFor: string }`
  - `AdminAlertSummary["type"]` passa a `"overdue" | "problem" | "outside_radius"`

- [ ] **Step 1: Teste falhando**

```ts
// packages/contracts/src/geo.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceMeters } from "./index.js";

test("distanceMeters is zero for the same point", () => {
  const p = { latitude: -3.1019, longitude: -60.025 };
  assert.equal(distanceMeters(p, p), 0);
});

test("distanceMeters matches a known Manaus distance within 1%", () => {
  // Teatro Amazonas -> Ponta Negra: ~12.9 km em linha reta
  const d = distanceMeters(
    { latitude: -3.1303, longitude: -60.0234 },
    { latitude: -3.0662, longitude: -60.1033 },
  );
  assert.ok(Math.abs(d - 11_390) / 11_390 < 0.01, `got ${d}`);
});

test("distanceMeters is symmetric", () => {
  const a = { latitude: -3.1, longitude: -60.0 };
  const b = { latitude: -3.1009, longitude: -60.0 };
  assert.equal(distanceMeters(a, b), distanceMeters(b, a));
  assert.equal(distanceMeters(a, b), 100);
});
```

(O valor de referência do segundo teste é recalculado no Step 2 com uma fórmula independente e fixado; o terceiro teste usa 0,0009° de latitude ≈ 100 m.)

- [ ] **Step 2: Rodar e ver falhar**: `npm test --workspace=@qqs/contracts` → `distanceMeters is not a function`.

- [ ] **Step 3: Implementar** em `index.ts`:

```ts
export type GeoPoint = { latitude: number; longitude: number };

const EARTH_RADIUS_METERS = 6_371_000;

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h)));
}
```

Mais os tipos listados em **Produces**.

- [ ] **Step 4: Rodar** contracts + `npm run typecheck` (raiz, backend e frontend). Corrigir usos de `CreateVisitRequest.systems` que deixam de existir só nos Tasks 5/9; aqui manter `systems?` opcional como `@deprecated` não é necessário porque nenhum chamador tipado usa o campo (verificar com `grep -rn "CreateVisitRequest" frontend backend`).

- [ ] **Step 5: Commit** `feat(contracts): add geo distance and client contracts`

---

### Task 2: Fundação do banco (schema, migração, abertura, seed)

**Files:**
- Modify: `backend/src/shared/db/schema.ts`
- Delete + regenerate: `backend/drizzle/0000_daily_pet_avengers.sql`, `backend/drizzle/meta/*` (a migração antiga nunca foi aplicada: o app não tinha conexão com banco; IDs viram `text` porque o app usa IDs como `visit-001` e UUIDs gerados no aparelho)
- Create: `backend/src/shared/db/database.ts`, `backend/src/shared/db/test-database.ts`, `backend/src/shared/db/seed.ts`
- Test: `backend/src/shared/db/database.test.ts`

**Interfaces:**
- Produces:
  - `type Database = PgDatabase<PgQueryResultHKT, typeof schema>`
  - `openDatabase(config: { url?: string; dataDir?: string }): Promise<{ db: Database; close(): Promise<void> }>`: migra antes de devolver. `url` → node-postgres; senão PGlite em `dataDir` (ou memória se ausente).
  - `createTestDatabase(): Promise<Database>`: PGlite em memória, migrado uma vez por processo; cada chamada faz `TRUNCATE ... RESTART IDENTITY CASCADE` de todas as tabelas.
  - `seedDevelopmentData(db: Database): Promise<void>`: 5 usuários atuais (`admin1@qqs.app`, `admin2@qqs.app`, `tecnico@qqs.app`, `carlos.silva@qqs.app`, `mariana.souza@qqs.app`, mesmas senhas), empresa `client-001` "Gases da Amazônia" (CNPJ válido de teste `11.222.333/0001-81`, Manaus, lat -3.1019, lng -60.025, raio 200 m) com sistemas Torre 1, Torre 2, Caldeira 1, e visita `visit-001` agendada para `2026-09-21T13:00:00.000Z` com `employee-001`.
  - Tabelas: `users`, `refresh_tokens`, `clients`, `client_systems`, `visits` (colunas abaixo).

- [ ] **Step 1: Teste falhando**

```ts
// backend/src/shared/db/database.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";

import { createTestDatabase } from "./test-database.js";
import { seedDevelopmentData } from "./seed.js";
import { users, clients, visits } from "./schema.js";

test("migrated database starts empty and seed fills users, client and visit", async () => {
  const db = await createTestDatabase();
  assert.equal((await db.select().from(users)).length, 0);

  await seedDevelopmentData(db);

  assert.equal((await db.select().from(users)).length, 5);
  const [client] = await db.select().from(clients);
  assert.equal(client.radiusMeters, 200);
  assert.equal((await db.select().from(visits))[0].id, "visit-001");
});

test("createTestDatabase truncates data between calls", async () => {
  const first = await createTestDatabase();
  await seedDevelopmentData(first);
  const second = await createTestDatabase();
  const result = await second.execute(sql`select count(*)::int as n from users`);
  assert.equal((result.rows[0] as { n: number }).n, 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**: `cd backend && node --test --import tsx src/shared/db/database.test.ts` → módulo inexistente.

- [ ] **Step 3: Schema**

```ts
// backend/src/shared/db/schema.ts
import { boolean, doublePrecision, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import type { ArrivalLocation, EmployeeSummary, VisitPhoto } from "@qqs/contracts";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const ts = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<"employee" | "supervisor">().notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: ts("expires_at").notNull(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radiusMeters: integer("radius_meters").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const clientSystems = pgTable("client_systems", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  createdAt: createdAt(),
}, (table) => [unique().on(table.clientId, table.name)]);

export const visits = pgTable("visits", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  employeeId: text("employee_id").notNull().references(() => users.id),
  status: text("status").$type<"assigned" | "in_progress" | "completed">().notNull().default("assigned"),
  scheduledFor: ts("scheduled_for"),
  arrivedAt: ts("arrived_at"),
  arrivalLocation: jsonb("arrival_location").$type<ArrivalLocation>(),
  arrivalDistanceMeters: integer("arrival_distance_meters"),
  outsideRadius: boolean("outside_radius").notNull().default(false),
  arrivalJustification: text("arrival_justification"),
  lastStartOperationId: text("last_start_operation_id").unique(),
  leftAt: ts("left_at"),
  departureLocation: jsonb("departure_location").$type<ArrivalLocation>(),
  durationMinutes: integer("duration_minutes"),
  description: text("description"),
  attendants: jsonb("attendants").$type<EmployeeSummary[]>(),
  photos: jsonb("photos").$type<VisitPhoto[]>(),
  finishedAt: ts("finished_at"),
  lastFinishOperationId: text("last_finish_operation_id").unique(),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 4: Regenerar migração**: `rm -r backend/drizzle && npm run db:generate --workspace=@qqs/backend`. Conferir o SQL gerado (5 tabelas, FKs, uniques).

- [ ] **Step 5: `database.ts`**

```ts
import { fileURLToPath } from "node:url";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema.js";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_FOLDER = fileURLToPath(new URL("../../../drizzle", import.meta.url));

export async function openDatabase(config: { url?: string; dataDir?: string }) {
  if (config.url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: config.url });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    return { db: db as unknown as Database, close: () => pool.end() };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(config.dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return { db: db as unknown as Database, close: () => client.close() };
}
```

- [ ] **Step 6: `test-database.ts`**: guarda a promessa de `openDatabase({})` num módulo-singleton; a cada chamada executa `TRUNCATE visits, client_systems, clients, refresh_tokens, users RESTART IDENTITY CASCADE`.

- [ ] **Step 7: `seed.ts`**: hashes bcrypt calculados uma vez por processo (cache em módulo) para o seed não custar 5 hashes por teste; `insert ... onConflictDoNothing()`.

- [ ] **Step 8: Rodar** o teste do Step 1 → PASS.

- [ ] **Step 9: Commit** `feat(backend): add drizzle schema, database bootstrap and dev seed`

---

### Task 3: Auth persistente e `createApp` com dependências

**Files:**
- Create: `backend/src/modules/auth/infrastructure/drizzle-user-repository.ts`, `drizzle-refresh-token-repository.ts`, `backend/src/test-support/http.ts`
- Modify: `backend/src/app.ts`, `backend/src/server.ts`, todos os `*.test.ts` que chamam `createApp()` (auth-routes, visit-routes, health-route)
- Delete: `backend/src/modules/auth/infrastructure/in-memory-user-repository.ts`, `in-memory-refresh-token-repository.ts` (testes de caso de uso que dependem deles passam a usar fakes locais ou o banco de teste; verificar com `grep -rn InMemoryUser backend/src`)
- Test: `backend/src/modules/auth/infrastructure/drizzle-auth-repositories.test.ts`

**Interfaces:**
- Consumes: `Database`, `createTestDatabase`, `seedDevelopmentData` (Task 2); `UserRepository`, `RefreshTokenRepository` (`auth/application/ports.ts`).
- Produces:
  - `class DrizzleUserRepository implements UserRepository` (`constructor(db: Database)`)
  - `class DrizzleRefreshTokenRepository implements RefreshTokenRepository`
  - `type AppDependencies = { db: Database; jwtSecret?: string }`; `createApp(deps: AppDependencies): Express`
  - `test-support/http.ts`: `call(app, options)`, `login(app, role)`, `createTestApp(): Promise<Express>` (banco limpo + seed + app), `authedCall(app, role, options)`

- [ ] **Step 1: Teste falhando** dos repositórios: salvar usuário, achar por e-mail (case exato, já normalizado pelo caso de uso), `list()` ordena por nome, `save()` de usuário existente atualiza (upsert); refresh token: `save`/`find`/`revoke`, `find` de token revogado → `undefined`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** repositórios com `insert().onConflictDoUpdate({ target: users.id, set })`; `expiresAt` convertido de/para ISO.
- [ ] **Step 4: `createApp(deps)`**: troca os `InMemory*` por Drizzle; o resto da montagem fica igual. Visitas continuam com `InMemoryVisitRepository` até o Task 5.
- [ ] **Step 5: `server.ts`**

```ts
import "dotenv/config";
import { createApp } from "./app.js";
import { openDatabase } from "./shared/db/database.js";
import { seedDevelopmentData } from "./shared/db/seed.js";

const { db } = await openDatabase({
  url: process.env.DATABASE_URL,
  dataDir: process.env.PGLITE_DATA_DIR ?? ".data/pglite",
});
if (process.env.NODE_ENV !== "production") await seedDevelopmentData(db);
// ...listen igual ao atual
```

Adicionar `.data/` ao `.gitignore`.

- [ ] **Step 6: Migrar testes HTTP** para `test-support/http.ts` (remove as três cópias de `call`).
- [ ] **Step 7: Rodar** `npm test --workspace=@qqs/backend` + typecheck → PASS.
- [ ] **Step 8: Commit** `feat(backend): persist users and refresh tokens with drizzle`

---

### Task 4: Módulo de empresas (RF-005 a RF-008)

**Files:**
- Create: `backend/src/modules/clients/{domain/client.ts, domain/cnpj.ts, application/ports.ts, application/client-use-cases.ts, infrastructure/drizzle-client-repository.ts, presentation/client-routes.ts}`
- Modify: `backend/src/app.ts`
- Test: `domain/cnpj.test.ts`, `application/client-use-cases.test.ts`, `presentation/client-routes.test.ts`

**Interfaces:**
- Consumes: `ClientSummary`, `CreateClientRequest`, `UpdateClientRequest`, `AddClientSystemRequest` (Task 1); `Database` (Task 2); `test-support/http.ts` (Task 3).
- Produces:
  - `normalizeCnpj(value: string): string` (só dígitos), `isValidCnpj(value: string): boolean`
  - `class InvalidClientError extends Error`, `ClientNotFoundError`, `CnpjAlreadyRegisteredError`
  - `type ClientRepository = { findById(id): Promise<ClientSummary | undefined>; findByCnpj(cnpj): Promise<ClientSummary | undefined>; list(filter: { q?: string; includeInactive?: boolean }): Promise<ClientSummary[]>; save(client: Omit<ClientSummary, "systems">): Promise<void>; addSystem(system: ClientSystem): Promise<void> }`
  - `createClient(repo, input, newId?)`, `updateClient(repo, id, input)`, `addClientSystem(repo, clientId, input, newId?)` → `Promise<ClientSummary>`
  - Rotas: `GET /clients?q=&includeInactive=true` (técnico vê só ativas; `includeInactive` só vale para supervisor), `GET /clients/:id`, `POST /clients` (supervisor, 201), `PATCH /clients/:id` (supervisor), `POST /clients/:id/systems` (supervisor, 201). Erros: 400 inválido, 404 não achada, 409 CNPJ repetido ou sistema com nome repetido na empresa.

- [ ] **Step 1: Testes de CNPJ** (Review Focus 5)

```ts
test("isValidCnpj accepts masked and unmasked forms of a valid CNPJ", () => {
  assert.equal(isValidCnpj("11.222.333/0001-81"), true);
  assert.equal(isValidCnpj("11222333000181"), true);
});
test("isValidCnpj rejects wrong check digits, wrong length and repeated digits", () => {
  assert.equal(isValidCnpj("11.222.333/0001-82"), false);
  assert.equal(isValidCnpj("1122233300018"), false);
  assert.equal(isValidCnpj("00000000000000"), false);
});
test("normalizeCnpj strips punctuation", () => {
  assert.equal(normalizeCnpj("11.222.333/0001-81"), "11222333000181");
});
```

- [ ] **Step 2: Implementar `cnpj.ts`** (pesos 5..2,9..2 e 6..2,9..2; resto < 2 → 0).
- [ ] **Step 3: Testes de caso de uso** contra `DrizzleClientRepository` + `createTestDatabase()`:
  - cria empresa com duas torres e uma caldeira (critério de aceitação do MVP) e lê de volta com 3 sistemas;
  - rejeita nome vazio, endereço vazio, latitude fora de [-90, 90], longitude fora de [-180, 180], raio ≤ 0 ou não inteiro → `InvalidClientError`;
  - CNPJ mascarado já cadastrado sem máscara → `CnpjAlreadyRegisteredError`;
  - `updateClient(id, { active: false })` some de `list({})` e aparece em `list({ includeInactive: true })`;
  - `list({ q: "gases" })` acha por nome sem diferenciar maiúsculas e `list({ q: "11222333" })` acha por CNPJ.
- [ ] **Step 4: Implementar** use cases + repositório (`ilike` em nome, `like` em CNPJ normalizado; sistemas carregados num segundo select por `inArray(clientIds)` e agrupados).
- [ ] **Step 5: Testes de rota**: técnico recebe 403 em `POST /clients`; supervisor cria (201) e o técnico enxerga em `GET /clients`; CNPJ com dígito errado → 400; repetido → 409; `GET /clients/inexistente` → 404.
- [ ] **Step 6: Rotas** + registro em `app.ts` depois de `authenticate`.
- [ ] **Step 7: Rodar** suíte backend + typecheck.
- [ ] **Step 8: Commit** `feat(backend): add clients module with systems and radius`

---

### Task 5: Visitas persistentes e validação de raio (RF-014 a RF-016, RF-042, RF-044)

**Files:**
- Create: `backend/src/modules/visits/infrastructure/drizzle-visit-repository.ts`
- Modify: `visits/domain/visit.ts`, `visits/application/start-visit.ts`, `visits/application/finish-visit.ts`, `visits/presentation/visit-routes.ts`, `admin/application/get-admin-dashboard.ts`, `admin/presentation/admin-routes.ts`, `app.ts`
- Keep: `in-memory-visit-repository.ts` só como fake de teste de caso de uso (sem seed; o seed de dev está no banco)
- Test: `start-visit.test.ts`, `drizzle-visit-repository.test.ts`, `visit-routes.test.ts`, `get-admin-dashboard.test.ts`

**Interfaces:**
- Consumes: `distanceMeters`, `ClientLocation` (Task 1); `ClientRepository` (Task 4).
- Produces:
  - `Visit` ganha `clientLocation?: ClientLocation`, `arrivalDistanceMeters?: number`, `outsideRadius?: boolean`, `arrivalJustification?: string`
  - `VisitRepository` ganha `findByFinishOperationId(op)` e `list(filter?: { employeeId?: string })`
  - `StartVisitInput` ganha `clientLocation: ClientLocation` e `justification?: string`
  - `evaluateRadius(clientLocation, location?): { distanceMeters?: number; outsideRadius: boolean }` exportada de `start-visit.ts`
  - Erro `"justification required"` → HTTP 422
  - `POST /visits`: aceita `id` do aparelho; se já existe, devolve 200 com a visita existente; exige `clientId` de empresa ativa (404 senão); nome, endereço, sistemas e coordenadas vêm da empresa
  - `GET /visits`: devolve `VisitDetails[]`; técnico recebe só as próprias, supervisor recebe todas
  - Dashboard: alerta `outside_radius` para visitas do dia com `outsideRadius`

- [ ] **Step 1: Testes de caso de uso (falhando)**

```ts
const client = { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 };

test("startVisit inside the radius records distance and no flag", async () => {
  const repo = new InMemoryVisitRepository();
  await repo.save(assignedVisit);
  const visit = await startVisit(repo, { ...base, clientLocation: client,
    location: { latitude: -3.1020, longitude: -60.0251 } });
  assert.equal(visit.outsideRadius, false);
  assert.ok((visit.arrivalDistanceMeters ?? 999) < 200);
});

test("startVisit outside the radius without justification is rejected", async () => {
  await assert.rejects(
    startVisit(repo, { ...base, clientLocation: client, location: { latitude: -3.119, longitude: -60.021 } }),
    /justification required/,
  );
});

test("startVisit outside the radius with justification is flagged", async () => {
  const visit = await startVisit(repo, { ...base, clientLocation: client,
    location: { latitude: -3.119, longitude: -60.021 }, justification: "Portaria fica a 2 km da planta" });
  assert.equal(visit.outsideRadius, true);
  assert.equal(visit.arrivalJustification, "Portaria fica a 2 km da planta");
});

test("startVisit without GPS requires justification and is flagged", async () => { // Review Focus 1
  await assert.rejects(startVisit(repo, { ...base, clientLocation: client }), /justification required/);
  const visit = await startVisit(repo, { ...base, operationId: "op-2", clientLocation: client, justification: "GPS sem sinal" });
  assert.equal(visit.outsideRadius, true);
  assert.equal(visit.arrivalDistanceMeters, undefined);
});

test("startVisit treats a whitespace-only justification as missing", async () => {
  await assert.rejects(startVisit(repo, { ...base, clientLocation: client, justification: "   " }), /justification required/);
});
```

- [ ] **Step 2: Implementar regra**

```ts
export function evaluateRadius(client: ClientLocation, location?: ArrivalLocation) {
  if (!location) return { distanceMeters: undefined, outsideRadius: true };
  const distance = distanceMeters(client, location);
  return { distanceMeters: distance, outsideRadius: distance > client.radiusMeters };
}
```

Em `startVisit`, depois da checagem de idempotência e de dados válidos: `const justification = input.justification?.trim() || undefined; if (radius.outsideRadius && !justification) throw new Error("justification required");` e gravar os três campos.

- [ ] **Step 3: `finishVisit` idempotente**: teste: duas chamadas com o mesmo `operationId` devolvem o mesmo resultado e a segunda não sobrescreve `finishedAt`. Implementar com `findByFinishOperationId`.
- [ ] **Step 4: Repositório Drizzle**: `findById` faz join com `clients` e carrega `client_systems`; `save` faz upsert só das colunas de `visits` e devolve `findById`. Teste contra o banco: salvar visita com fotos/acompanhantes (jsonb) e ler igual; datas voltam como ISO `...Z`.
- [ ] **Step 5: Rotas**: `POST /visits/:id/start` busca a empresa da visita e passa `clientLocation`; 422 para justificativa ausente. Testes:
  - check-in dentro do raio (`-3.1020, -60.0251`) → 200, `arrival.outsideRadius === false`;
  - fora do raio sem justificativa → 422; com justificativa → 200 e `arrival.justification` preenchida;
  - `POST /visits` com o mesmo `id` duas vezes → 201 e depois 200, `GET /visits` (supervisor) com uma ocorrência só (Review Focus 4);
  - `POST /visits` com `clientId` inexistente → 404;
  - técnico `carlos.silva` não vê `visit-001` em `GET /visits`;
  - atualizar os testes existentes que usam `-3.119, -60.021` para coordenadas dentro do raio.
- [ ] **Step 6: Dashboard**: teste: visita do dia com `outsideRadius` gera alerta `outside_radius` com mensagem `Check-in fora do raio: Gases da Amazônia (1916 m)` (ou `sem GPS` quando sem distância).
- [ ] **Step 7: `app.ts`** usa `DrizzleVisitRepository` e `DrizzleClientRepository`.
- [ ] **Step 8: Rodar** suíte backend + typecheck.
- [ ] **Step 9: Commit** `feat(backend): persist visits and enforce check-in radius`

---

### Task 6: Armazenamento no aparelho e fila persistente (RF-039 a RF-043, RNF-010)

**Files:**
- Create: `frontend/src/modules/sync/key-value-storage.ts`, `device-storage.ts`, `local-id.ts`, `frontend/mock-sqlite-kv.cjs`
- Modify: `frontend/setup-tests.cjs`, `sync/local-cache.ts`, `sync/sync-queue.ts`, `visits/visit-store.ts`, `visits/start-visit.ts`, `visits/finish-visit.ts` e testes
- Test: `sync/sync-queue.test.ts`, `sync/local-cache.test.ts`, `visits/visit-store.test.ts`, `sync/local-id.test.ts`

**Interfaces:**
- Produces:
  - `type KeyValueStorage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; removeItem(key: string): Promise<void> }`
  - `createMemoryKeyValueStorage(): KeyValueStorage`
  - `deviceStorage: KeyValueStorage` (default export de `expo-sqlite/kv-store`)
  - `createPersistentLocalCache<T>(storage, namespace): LocalCache<T>` (JSON, chave `${namespace}:${key}`)
  - `SyncQueue`: `static open(storage, key = "sync-queue"): Promise<SyncQueue>`; `enqueue`, `confirm` e `process` passam a `async`; `process` para na primeira falha; ao abrir, `syncing` vira `failed`
  - `VisitStore`: `static open(storage): Promise<VisitStore>`; `set`, `setAll(items: VisitDetails[])` async e persistentes; `get`, `list` síncronos
  - `createLocalId(): string` (UUID v4)

- [ ] **Step 1: Testes falhando**

```ts
test("queue restores pending operations after the app restarts", async () => {
  const storage = createMemoryKeyValueStorage();
  const first = await SyncQueue.open(storage);
  await first.enqueue({ operationId: "op-1", entityId: "visit-1", type: "visit.start", payload: {} });

  const reopened = await SyncQueue.open(storage);
  assert.deepEqual(reopened.pending().map((op) => op.operationId), ["op-1"]);
});

test("an operation interrupted while syncing is retried after restart", async () => { // Review Focus 2
  const storage = createMemoryKeyValueStorage();
  const queue = await SyncQueue.open(storage);
  await queue.enqueue({ operationId: "op-1", entityId: "v", type: "visit.start", payload: {} });
  const stuck = queue.process(() => new Promise(() => {})); // nunca resolve: simula app morto
  await new Promise((r) => setImmediate(r));
  void stuck;

  const reopened = await SyncQueue.open(storage);
  assert.equal(reopened.get("op-1")?.status, "failed");
  assert.equal(reopened.pending().length, 1);
});

test("process stops at the first failure and keeps order", async () => { // Review Focus 3
  const queue = new SyncQueue();
  await queue.enqueue({ operationId: "start", entityId: "v", type: "visit.start", payload: {} });
  await queue.enqueue({ operationId: "finish", entityId: "v", type: "visit.finish", payload: {} });
  const sent: string[] = [];
  await queue.process(async (op) => { sent.push(op.operationId); throw new Error("offline"); });
  assert.deepEqual(sent, ["start"]);
  assert.equal(queue.get("finish")?.status, "pending");
});

test("visit store survives a restart", async () => {
  const storage = createMemoryKeyValueStorage();
  const store = await VisitStore.open(storage);
  await store.set(sampleVisit);
  assert.equal((await VisitStore.open(storage)).get(sampleVisit.id)?.clientName, sampleVisit.clientName);
});

test("createLocalId returns distinct RFC 4122 v4 ids", () => {
  const a = createLocalId();
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(a, createLocalId());
});
```

- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar.** `SyncQueue` guarda a lista inteira em `storage.setItem(key, JSON.stringify([...operations.values()]))` a cada mutação (await antes de retornar). `createLocalId` usa `globalThis.crypto?.randomUUID?.()` e cai para `crypto.getRandomValues`/`Math.random` com bits de versão e variante fixos.
- [ ] **Step 4: Mock** `mock-sqlite-kv.cjs` (Map com `getItem`, `setItem`, `removeItem`) e mapeamento de `expo-sqlite/kv-store` em `setup-tests.cjs`.
- [ ] **Step 5: Ajustar** `start-visit.ts`, `finish-visit.ts`, `VisitDetailsScreen.tsx` e testes para `await queue.enqueue/confirm` e `await store.set`.
- [ ] **Step 6: Rodar** `npm test --workspace=@qqs/frontend` + typecheck.
- [ ] **Step 7: Commit** `feat(frontend): persist sync queue and visits on device`

---

### Task 7: Sincronização e dados reais na área do técnico (RF-012, RF-041, RF-042)

**Files:**
- Create: `frontend/src/modules/sync/sync-runner.ts`, `sync/DeviceDataContext.tsx`, `clients/client-api.ts`, `clients/ClientPicker.tsx`
- Modify: `app/_layout.tsx`, `app/index.tsx`, `app/visit/[id].tsx`, `visits/visit-api.ts`, `visits/VisitsScreen.tsx`, `visits/TechnicianCreateVisitModal.tsx`
- Test: `sync/sync-runner.test.ts`, `clients/ClientPicker.test.tsx`, `visits/TechnicianCreateVisitModal.test.tsx`, `visits/VisitsScreen.test.tsx`

**Interfaces:**
- Consumes: `SyncQueue.open`, `VisitStore.open`, `deviceStorage`, `createPersistentLocalCache`, `createLocalId` (Task 6); `ClientSummary`, `CreateVisitRequest` (Task 1); `GET /visits` → `VisitDetails[]`, `GET /clients`, `POST /visits` idempotente (Tasks 4 e 5).
- Produces:
  - `createVisitOperationProcessor(api: Pick<VisitApi, "createVisit" | "startVisit" | "finishVisit">): OperationProcessor`: tipos `visit.create`, `visit.start`, `visit.finish`; tipo desconhecido lança erro
  - `syncPending(queue, api): Promise<{ remaining: number }>`
  - `DeviceDataProvider`, `useDeviceData(): { queue: SyncQueue; store: VisitStore; clientsCache: LocalCache<ClientSummary[]>; ready: boolean }`
  - `ClientApi = { listClients(q?: string): Promise<ClientSummary[]>; createClient(r): Promise<ClientSummary>; updateClient(id, r): Promise<ClientSummary>; addSystem(id, r): Promise<ClientSummary> }`, `createClientApi(accessToken?, fetcher?, baseUrl?)`
  - `ClientPicker({ clients, selectedId, onSelect })` com campo de busca por nome/CNPJ
  - `TechnicianVisitDraft = { client: ClientSummary; scheduledFor: string }`
  - `VisitApi.listVisits(): Promise<VisitDetails[]>`

- [ ] **Step 1: Testes do runner**: processa `visit.create` chamando `createVisit(payload)`, `visit.start` chamando `startVisit(entityId, payload)`; tipo desconhecido fica `failed`; `syncPending` retorna `remaining`.
- [ ] **Step 2: Implementar runner.**
- [ ] **Step 3: Testes de UI**: `ClientPicker` filtra por "gases" e por parte do CNPJ; modal do técnico não salva sem empresa escolhida e, com empresa, chama `onSave({ client, scheduledFor })`.
- [ ] **Step 4: Implementar** `client-api.ts`, `ClientPicker.tsx`, modal novo (troca os campos de texto livre pela lista de empresas).
- [ ] **Step 5: `DeviceDataProvider`** em `_layout.tsx` (dentro de `AuthProvider`); abre fila, store e cache de empresas uma vez.
- [ ] **Step 6: `app/index.tsx`**: mostra `store.list()` na hora (offline), depois `syncPending` e `api.listVisits()` → `store.setAll` e `clientsCache.write("all", await clientApi.listClients())`; falha de rede mantém o cache. Criar visita: monta `VisitDetails` local com `id = createLocalId()`, `clientLocation` e sistemas da empresa, `store.set`, `queue.enqueue({ type: "visit.create", payload: { id, clientId, scheduledFor } })`, tenta `syncPending`.
- [ ] **Step 7: `app/visit/[id].tsx`**: `store.get(id)`; se ausente e online, `api.getVisit(id)`; enquanto carrega, indicador; não encontrada → mensagem "Visita não encontrada neste aparelho".
- [ ] **Step 8: Rodar** suíte frontend + typecheck.
- [ ] **Step 9: Commit** `feat(frontend): sync queue runner and real technician data`

---

### Task 8: Check-in com raio e justificativa no aparelho (RF-015, RF-016)

**Files:**
- Create: `frontend/src/modules/visits/arrival.ts`, `visits/ArrivalJustification.tsx`
- Modify: `visits/start-visit.ts`, `visits/VisitDetailsScreen.tsx`, `visits/VisitCard.tsx` (selo "Fora do raio")
- Test: `visits/arrival.test.ts`, `visits/start-visit.test.ts`, `visits/VisitDetailsScreen.test.tsx`

**Interfaces:**
- Consumes: `distanceMeters`, `ClientLocation`, `VisitArrival` (Task 1); `LocationProvider`.
- Produces:
  - `type ArrivalEvaluation = { location?: ArrivalLocation; locationStatus: "granted" | "denied" | "unavailable"; distanceMeters?: number; outsideRadius: boolean }`
  - `evaluateArrival(provider: LocationProvider, clientLocation?: ClientLocation): Promise<ArrivalEvaluation>`: sem `clientLocation` (visita antiga sem empresa) → `outsideRadius: false`
  - `startVisit(input)` recebe `arrival: ArrivalEvaluation` e `justification?: string` em vez de `locationProvider`
  - `ArrivalJustification({ distanceMeters?, radiusMeters, onConfirm(justification), onCancel })`

- [ ] **Step 1: Testes de `evaluateArrival`**: dentro do raio; fora do raio com distância; permissão negada → `outsideRadius: true` sem distância (Review Focus 1).
- [ ] **Step 2: Implementar.**
- [ ] **Step 3: Teste de tela**: com provider fora do raio, tocar "Registrar chegada" mostra o cartão "Você está a 1916 m da empresa (raio de 200 m)"; confirmar sem texto fica desabilitado; com texto chama `api.startVisit` com `justification`; com provider dentro do raio chama direto sem cartão. Sem GPS o texto diz "Localização indisponível".
- [ ] **Step 4: Implementar** cartão e fluxo no `VisitDetailsScreen` (avalia uma vez, guarda a avaliação no estado e reaproveita ao confirmar; nada de pedir GPS duas vezes). `VisitCard` mostra `Badge` "Fora do raio" quando `arrival.outsideRadius`.
- [ ] **Step 5: Rodar** suíte frontend + typecheck.
- [ ] **Step 6: Commit** `feat(frontend): require justification for out-of-radius check-in`

---

### Task 9: Empresas e dados reais na área do administrador (RF-005 a RF-008, RF-012a, RF-034)

**Files:**
- Create: `frontend/src/modules/clients/ClientsScreen.tsx`, `clients/ClientForm.tsx`, `app/admin/clients.tsx`
- Modify: `app/admin/index.tsx`, `admin/AdminHomeScreen.tsx` (botão "Empresas", remove `DEFAULT_VISITS`/`DEFAULT_EMPLOYEES` como fonte de produção, mantendo props), `admin/AdminScheduleModal.tsx` (escolhe empresa com `ClientPicker`), `admin/AdminDashboardSummary.tsx` (ícone para `outside_radius`)
- Test: `clients/ClientForm.test.tsx`, `clients/ClientsScreen.test.tsx`, `admin/AdminHomeScreen.test.tsx`

**Interfaces:**
- Consumes: `ClientApi`, `ClientPicker` (Task 7); `CreateClientRequest` (Task 1); `VisitApi.createVisit`, `listVisits`, `listEmployees`.
- Produces:
  - `ClientForm({ initial?, onSubmit(request: CreateClientRequest), submitting })`: campos nome, CNPJ, endereço, latitude, longitude, raio (padrão 200), lista de sistemas (nome + tipo) com "Adicionar sistema"; aceita vírgula decimal ("-3,1019")
  - `ClientsScreen({ api: ClientApi })`: lista com busca, cria, ativa/inativa
  - `AdminScheduleModal` passa `onSave({ client: ClientSummary; employeeId; scheduledFor })`

- [ ] **Step 1: Testes do formulário**: não envia com CNPJ inválido (mostra "CNPJ inválido"); converte "-3,1019" para -3.1019; envia duas torres e uma caldeira.
- [ ] **Step 2: Implementar `ClientForm`.**
- [ ] **Step 3: Teste de `ClientsScreen`** com API fake: lista empresas, botão "Inativar" chama `updateClient(id, { active: false })`, erro 409 mostra "CNPJ já cadastrado".
- [ ] **Step 4: Implementar** tela e rota `app/admin/clients.tsx`; botão "Empresas" na home do admin navega para ela.
- [ ] **Step 5: `app/admin/index.tsx`** carrega visitas, funcionários e empresas da API e agenda via `createVisit({ id: createLocalId(), clientId, employeeId, scheduledFor })`; atualizar teste da home para o modal com empresa.
- [ ] **Step 6: Rodar** suíte frontend + backend + typecheck.
- [ ] **Step 7: Commit** `feat(frontend): admin clients screen and live admin data`

---

## Fora deste plano (próximos)

- Upload de fotos para armazenamento de objetos (hoje a `uri` local vai no JSON).
- Idempotência persistente das ações administrativas (`createAdminActions` ainda guarda operações em memória).
- Checklists por tipo de sistema (aguarda RA-006), assinatura, PDF e relatórios.
- Tratamento de erro 4xx permanente na fila (hoje reenvia até o usuário corrigir).
