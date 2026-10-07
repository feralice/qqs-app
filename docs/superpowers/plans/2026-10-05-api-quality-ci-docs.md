# Qualidade da API, CI e Documentação: Handoff

> Documento de passagem para outro agente continuar. Branch: `feat/api-quality-ci-docs` (criada a partir de `feat/persistence-clients-radius`). **Nada foi commitado ainda**: todo o trabalho abaixo está no working tree.

## Retomada em 2026-10-06

Este handoff foi executado no workspace existente, sem commits e sem alterar a branch.

- O smoke HTTP passou com servidor real e PGlite temporário: health, Swagger, OpenAPI, login, CSV com BOM, empresas, visitas e erros de body inválido/JSON malformado.
- Task B: corrigidos filtros ausentes/em branco do frontend, período padrão do histórico via `Clock` e componentes OpenAPI de entrada/saída que dependiam da ordem. Os testes falharam antes das correções e passaram depois.
- A revisão também encontrou senhas e tokens nos logs de `auth-api`. Os logs foram removidos, com teste de regressão e preservação das respostas de erro e logout.
- Task C: CI com Node 22, npm ci, typechecks, testes, cobertura como artefato e check de migrações; Dependabot e template de PR criados. ESLint opcional não foi instalado. `npm ci --dry-run --ignore-scripts` passou; isso não substitui executar o workflow no GitHub.
- Task D: CLAUDE.md, AGENTS.md, README, CONTRIBUTING, cinco ADRs e arquitetura atualizados; guia local corrigido para o novo caminho do schema. Links locais e YAML conferidos.
- Verificações: 126 testes de backend, 103 de frontend e 10 de contracts passaram; `typecheck:all`, cobertura e `db:check` passaram. Cobertura exclui arquivos de teste e helpers.
- Notificações foram mantidas como núcleo não integrado. A documentação registra esse limite e a falta de atomicidade entre ação e registro da idempotência.

A versão web iniciou na porta 8099: HTML e bundle JavaScript retornaram HTTP 200. Os clientes HTTP reais do frontend passaram contra a API local em login, empresas, visitas, histórico com filtros ausentes e logout. Isso valida a integração, mas não substitui a interação visual.

**Pendente:** conferir visualmente login, lista de visitas e empresas num navegador. O ambiente não tem navegador automatizado disponível. O CI só poderá ser observado no GitHub após publicação autorizada das alterações.

As seções abaixo preservam o contexto original da passagem. Os números e pendências originais devem ser lidos como estado anterior à retomada.

## Regras da dona do projeto (obrigatórias)

- Não commitar sem ela pedir explicitamente. Nunca colocar IA como coautora no commit.
- Nunca usar travessão (o caractere "—") em texto, doc ou comentário. Usar dois-pontos ou reescrever.
- Em listas, variar a forma gramatical dos itens (não começar todos com substantivo em "-ção").
- Comentários de código: poucos, só o "porquê" não óbvio, em português, como o resto do repo.
- Objetivo geral: projeto de portfólio nível pleno (Clean Architecture, SOLID, testes, CI, Swagger, docs).

## Estado verificado

- Backend: `npm test --workspace=@qqs/backend` → **118 testes passando**; `npx tsc -p backend/tsconfig.json --noEmit` limpo.
- Frontend e contracts não foram alterados nesta etapa (antes: 97 e 10 testes passando).
- Smoke test com servidor real (curl em `/docs`, `/openapi.json`, CSV) **não foi executado**: rodar antes de dar como pronto.

## O que foi feito

### 1. Backend reorganizado no formato Clean Architecture (diagrama "Domain / Application / Infrastructure / WebUI")

Antes as camadas ficavam dentro de cada módulo (`src/modules/<m>/{domain,application,...}`). Agora:

```text
backend/src/
  domain/            entidades, invariantes e exceções; só importa @qqs/contracts
    common/          actor.ts (quem faz a requisição), errors.ts (AppError + categorias)
    auth/ clients/ visits/
  application/       casos de uso em CQRS (commands/ e queries/) + ports (interfaces)
    common/          clock.ts, idempotency.ts (port + runOnce), tabular-exporter.ts
    admin/ auth/ clients/ visits/ notifications/
  infrastructure/    implementações dos ports
    db/ (Drizzle, schema, seed, test-database)  persistence/ (repositórios Drizzle)
    security/ (bcrypt, JWT, rate limiter)  idempotency/  csv/  clock/  logging/ (pino)
  presentation/      "WebUI": Express, rotas, OpenAPI e composition root (app.ts)
    http/ (api-router, error-handler, openapi, authenticate, request-logger, schemas)
    routes/<modulo>/ (rotas + schemas zod + presenters)
  test-support/      fakes em memória e helpers HTTP de teste
  architecture.test.ts
  server.ts, config.ts
```

- **Teste de arquitetura** (`src/architecture.test.ts`): falha se algum import apontar para fora (ex.: domain importando infra, application importando express/drizzle/zod). Testado com violação proposital: pega as duas.
- Regras de negócio que estavam na rota foram para casos de uso: `createVisit` (idempotente por id do aparelho), `getVisibleVisit`/`listVisibleVisits`, `listClients`/`getClient`, `listEmployees`.
- Regra de raio (`evaluateRadius`) e validação de chegada foram para `domain/visits/arrival.ts`; invariantes de empresa (CNPJ, coordenadas, raio, sistemas únicos) para `domain/clients/client.ts`.
- `client-use-cases.ts` (3 comandos num arquivo) virou `create-client.ts`, `update-client.ts`, `add-client-system.ts`.
- Ports novos: `Clock` (tempo injetável), `TabularExporter` (CSV é detalhe de infra), `IdempotencyStore`.

### 2. Erros tipados e handler central

- `domain/common/errors.ts`: `AppError` com `kind` (`validation`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `unprocessable`, `rate_limited`). Exceções de domínio herdam daí, mantendo as mensagens antigas (frontend e testes dependem delas).
- `presentation/http/error-handler.ts` é o único lugar que traduz categoria em status HTTP. Antes cada rota tinha try/catch e mapeava erro por string.
- Decisão registrada para virar ADR: não usar `http-errors`/`boom` porque amarram o domínio a status HTTP.

### 3. Validação zod + OpenAPI/Swagger gerados da mesma fonte

- `presentation/http/api-router.ts`: `api.route({ method, path, access, body, query, responses, ... }, handler)` registra a rota no Express, aplica os guards de acesso, valida body/query com zod e guarda a especificação.
- `access` é obrigatório (`public | authenticated | supervisor`); em rota protegida o handler recebe `auth` não opcional pelo tipo.
- Schemas usam `satisfies z.ZodType<TipoDoContrato>`: se `@qqs/contracts` mudar, quebra em compilação.
- `presentation/http/openapi.ts` gera OpenAPI 3.1 a partir das rotas registradas (zod 4 `z.toJSONSchema`, sem lib extra). Servido em `GET /openapi.json` e Swagger UI em `/docs`.
- `openapi.test.ts` valida o documento contra o schema oficial OpenAPI 3.1 (`@seriousme/openapi-schema-validator`), confere refs e a Swagger UI.

### 4. Pendências do plano anterior resolvidas

- Idempotência persistente das ações admin: tabela `processed_operations` (migração `backend/drizzle/0001_processed_operations.sql`), `DrizzleIdempotencyStore` com `onConflictDoNothing`. Antes era um `Map` que sumia no restart.
- Export CSV do histórico (RF-037): `GET /admin/history.csv`, separador `;`, BOM UTF-8, proteção contra CSV injection (OWASP).
- `GET /admin/history` agora responde `VisitDetails` (não vaza `lastStartOperationId` etc.).
- Logger estruturado pino (`infrastructure/logging/logger.ts`, com redact de senha/token) e middleware próprio `request-logger.ts` (o `pino-http` foi removido porque quebra com `node-mocks-http`).
- A fila do app já tratava 4xx permanente (`isPermanentRejection`): nada a fazer.

### Dependências adicionadas (backend)

`zod@4`, `pino`, `swagger-ui-express`; dev: `@types/swagger-ui-express`, `@seriousme/openapi-schema-validator`.

## O que falta fazer (em ordem)

### Task A: Smoke test do servidor real

1. `PORT=3399 PGLITE_DATA_DIR=<pasta temporária> npx tsx backend/src/server.ts`
2. Conferir: `GET /health`, `GET /docs/` (200), `GET /openapi.json`, login de `admin1@qqs.app` / `Admin123!`, `GET /admin/history.csv?from=2000-01-01&to=2100-01-01` com o token, `POST /clients` com corpo inválido (400 com `details`) e com JSON malformado (400 `malformed json body`).
3. Abrir o app web (`npm run dev:web`) e conferir login, lista de visitas e tela de empresas: o formato de erro e o histórico mudaram de forma compatível, mas validar na prática.

### Task B: Revisão e simplificação

1. Rodar um code review no diff (`git diff feat/persistence-clients-radius`).
2. Pontos a olhar: `openapi.ts` (renomeação `Input` de componentes), o default `today()` em `admin-schemas.ts` (usa `new Date`, não o `Clock`), `application/notifications/notification-service.ts` (não está ligado a nada; decidir se fica).
3. Possível bug pré-existente no frontend: `frontend/src/modules/admin/admin-api.ts` monta `new URLSearchParams(filters)`; filtros `undefined` viram a string `"undefined"`. Conferir em `AdminHistoryScreen` e corrigir filtrando chaves vazias, com teste.

### Task C: GitHub Actions e qualidade de repositório

1. `.github/workflows/ci.yml`: gatilhos em `push` e `pull_request`; Node 22; `npm ci`; jobs (ou steps) para typecheck da raiz, backend e frontend; testes de contracts, backend e frontend; cobertura com `node --test --experimental-test-coverage` no backend publicada como artefato ou no summary.
2. Step extra: `npx drizzle-kit check` para garantir migrações consistentes com o schema.
3. `.github/dependabot.yml` (npm semanal + github-actions) e `.github/pull_request_template.md`.
4. Opcional: ESLint flat config com `typescript-eslint` e script `lint` real (hoje `lint` só roda `tsc`).
5. Badge do workflow no README.

### Task D: Documentação (portfólio)

1. **`CLAUDE.md` na raiz** (pedido explícito da dona) explicando o projeto para agentes de IA: visão geral, mapa de pastas, a regra de dependência e o teste que a garante, como criar uma rota nova com `api.route` (exemplo curto), onde colocar regra de negócio vs. validação de formato, comandos de teste/typecheck, convenções (comentários em português, sem travessão, conventional commits, não commitar sem pedir) e o fluxo de trabalho com IA (spec e plano em `docs/superpowers`, TDD, revisão antes de commit). Criar também `AGENTS.md` apontando para o mesmo conteúdo, para outras ferramentas.
2. README reescrito: o que é o app, stack, diagrama de arquitetura (mermaid), como rodar, link para `/docs`, como testar, badge de CI, decisões principais.
3. ADRs em `docs/adr/`: monólito modular com Clean Architecture; erros por categoria em vez de `http-errors`; zod como fonte única de validação e OpenAPI; Drizzle + PGlite no desenvolvimento; offline-first com fila e idempotência por `operationId`.
4. `CONTRIBUTING.md`: branch, conventional commits, checklist de PR.
5. Atualizar `docs/arquitetura/ARQ-001-qqs-app.md` com a nova estrutura de pastas.

### Fora deste plano (continua bloqueado)

- Checklists por tipo de sistema (aguarda RA-006), assinatura (RA-004), geração de PDF, upload de fotos para armazenamento de objetos.

## Comandos de verificação

```bash
npm run typecheck
npm run typecheck --workspace=@qqs/backend
npm run typecheck --workspace=@qqs/frontend
npm test --workspace=@qqs/contracts
npm test --workspace=@qqs/backend    # ~1 min, 118 testes
npm test --workspace=@qqs/frontend   # ~1 min, 97 testes
```
