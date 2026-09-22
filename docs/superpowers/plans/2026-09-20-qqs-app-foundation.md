# QQS App Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar a base executável do aplicativo mobile offline-first e da API Express modular, com contratos iniciais para autenticação, clientes, sistemas, checklists e visitas.

**Architecture:** Monorepo npm com projetos fisicamente separados (`frontend` e `backend`) e um pacote de contratos compartilhados. O frontend usará Expo/React Native; o backend usará Express/TypeScript; a persistência e o fluxo completo de sincronização entrarão em etapas posteriores.

**Tech Stack:** Node.js 22, TypeScript, React Native, Expo, Expo Router, Express, Zod, PostgreSQL, Drizzle ORM, Drizzle Kit, Jest/Vitest e Supertest.

**Spec:** `docs/requisitos/RS-001-qqs-app-v0.2.md` e `docs/arquitetura/ARQ-001-qqs-app.md`

## Global Constraints

- O produto inicial é mobile-only.
- A identidade visual usa exatamente `#0876C9`, `#B9DDF8`, `#72BAB8`, `#FFFFFF`, `#242424` e `#383838`.
- O preenchimento de visitas deve funcionar offline.
- O backend deve ser um monólito modular, sem microserviços.
- Nenhuma regra de negócio deve depender diretamente de Express ou Prisma.
- A API deve aceitar retentativas idempotentes de sincronização.
- Requisitos marcados como em aberto não serão inventados durante a implementação.

## Review Focus

- Repetição de uma operação offline: não pode duplicar visita ou resposta.
- Fechamento do app durante uma visita: dados locais devem permanecer salvos.
- Usuário sem permissão: não pode acessar operações administrativas.
- Checklist incompleto: não pode encerrar visita quando houver campo obrigatório ausente.
- Mudança de conexão durante o envio: operação deve permanecer pendente e ser repetível.

### Task 1: Frontend, backend e contratos base

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `packages/contracts/src/index.ts`
- Create: `backend/package.json`
- Create: `frontend/package.json`
- Create: `.gitignore`

**Interfaces:**
- Produces: workspace names `@qqs/backend`, `@qqs/frontend` and `@qqs/contracts`.

- [ ] Criar os workspaces npm e scripts `typecheck`, `test` e `lint`.
- [ ] Definir tipos compartilhados para `UserRole`, `SyncStatus`, `VisitStatus` e identificadores.
- [ ] Rodar `npm install` e `npm run typecheck` para validar a base.

### Task 2: Shell executável do backend

**Files:**
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/shared/http/health-route.ts`
- Test: `backend/src/shared/http/health-route.test.ts`

**Interfaces:**
- Produces: `createApp(): Express` e `GET /health` retornando `{ status: "ok" }`.

- [ ] Escrever teste para `GET /health`.
- [ ] Implementar `createApp` sem iniciar socket durante testes.
- [ ] Implementar `server.ts` para iniciar a API apenas fora do ambiente de teste.
- [ ] Rodar o teste da rota e o typecheck.

### Task 3: Fundação do frontend Expo

**Files:**
- Create: `frontend/app.json`
- Create: `frontend/app/index.tsx`
- Create: `frontend/src/shared/ui/AppShell.tsx`
- Test: `frontend/src/shared/ui/AppShell.test.tsx`

**Interfaces:**
- Produces: tela inicial executável e navegação preparada para autenticação e visitas.

- [ ] Criar o shell Expo com TypeScript e rota inicial.
- [ ] Renderizar a identificação do projeto e o estado de conexão.
- [ ] Testar o render da tela inicial.
- [ ] Executar o typecheck e o comando de desenvolvimento do Expo.

### Task 4: Domínio inicial de visitas

**Files:**
- Create: `apps/api/src/modules/visits/domain/visit.ts`
- Create: `apps/api/src/modules/visits/application/start-visit.ts`
- Test: `apps/api/src/modules/visits/application/start-visit.test.ts`

**Interfaces:**
- Consumes: `ClientId`, `UserId` e `VisitId` de `@qqs/contracts`.
- Produces: visita com estado `in_progress` e horário de chegada.

- [ ] Escrever teste para iniciar visita com UUID e horário fornecidos.
- [ ] Rejeitar início duplicado para o mesmo identificador idempotente.
- [ ] Implementar entidade e caso de uso sem banco ou Express.
- [ ] Rodar testes unitários do domínio.

### Task 5: Persistência local e fila de sincronização

**Files:**
- Create: `apps/mobile/src/modules/sync/local-operation.ts`
- Create: `apps/mobile/src/modules/sync/sync-queue.ts`
- Test: `apps/mobile/src/modules/sync/sync-queue.test.ts`

**Interfaces:**
- Produces: operações locais com `operationId`, `entityId`, `type`, `payload` e `status`.

- [ ] Testar que uma operação enfileirada permanece pendente até confirmação.
- [ ] Testar que uma confirmação repetida não cria uma segunda operação.
- [ ] Implementar a fila atrás de uma interface de armazenamento.
- [ ] Adicionar adaptador SQLite somente após o contrato em memória estar testado.

### Task 6: Verificação do primeiro incremento

**Files:**
- Modify: `README.md`
- Create: `docs/desenvolvimento/ambiente-local.md`

- [ ] Documentar instalação, comandos e variáveis necessárias.
- [ ] Rodar typecheck, testes da API e testes do mobile.
- [ ] Iniciar API e confirmar `/health`.
- [ ] Iniciar Expo e confirmar a tela inicial.
