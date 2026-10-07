# Ambiente local

## Pré-requisitos

- Node.js 22 ou superior.
- npm 10 ou superior.
- Expo CLI via o script do workspace.
- PostgreSQL 16 é opcional no desenvolvimento: sem `DATABASE_URL`, o backend usa PGlite (Postgres embutido) gravando em `backend/.data/pglite`.

## Instalação

Na raiz do projeto:

```bash
npm ci
```

## Verificações

```bash
npm run typecheck:all
npm test --workspace=@qqs/backend
npm test --workspace=@qqs/frontend
```

## Backend

```bash
npm run dev --workspace=@qqs/backend
```

A API sobe na porta `3333` (`GET /health`). Swagger UI fica em `http://localhost:3333/docs/` e o documento OpenAPI em `http://localhost:3333/openapi.json`. Ao iniciar, aplica as migrações de `backend/drizzle/`. As contas de teste e a empresa Gases da Amazônia só são semeadas no PGlite local ou com `SEED_DEV_DATA=true` (nunca com `NODE_ENV=production`). Com `DATABASE_URL`, o `JWT_SECRET` é obrigatório.

Banco usado pelo backend:

| Situação | Banco |
|---|---|
| `DATABASE_URL` definida | PostgreSQL (por exemplo o do `docker-compose.yml`) |
| Sem `DATABASE_URL` | PGlite em `PGLITE_DATA_DIR` (padrão `.data/pglite`) |
| Testes | PGlite em memória, zerado a cada teste |

```bash
docker compose up -d postgres
DATABASE_URL=postgres://qqs:qqs_dev_password@localhost:5432/qqs JWT_SECRET=troque-isto SEED_DEV_DATA=true npm run dev --workspace=@qqs/backend
```

Depois de mudar `backend/src/infrastructure/db/schema.ts`, gere a migração com `npm run db:generate --workspace=@qqs/backend`.

Contas de teste: `admin1@qqs.app` / `Admin123!` e `tecnico@qqs.app` / `Tecnico123!`.

## Frontend

```bash
npm start --workspace=@qqs/frontend
```

Para apontar o app para outra API durante o desenvolvimento, configure
`EXPO_PUBLIC_API_URL`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:3333 npm start --workspace=@qqs/frontend
```

Se a variável não for definida, o cliente usa `http://127.0.0.1:3333`.

No aparelho, visitas, empresas e a fila de sincronização ficam gravadas com `expo-sqlite` (no navegador, em `localStorage`). O app funciona offline com o que já foi baixado e reenvia a fila quando a lista de visitas é aberta ou o técnico toca em "Sincronizar".

O frontend usa Expo Router e a paleta visual definida no documento de arquitetura:

| Uso | Cor |
|---|---|
| Azul corporativo | `#0876C9` |
| Azul-claro | `#B9DDF8` |
| Verde-água | `#72BAB8` |
| Branco | `#FFFFFF` |
| Cinza quase preto | `#242424` |
| Cinza-escuro | `#383838` |

## Observação de dependências

O primeiro `npm ci` do Expo reportou vulnerabilidades transitivas. Não executar `npm audit fix --force` sem revisar possíveis atualizações incompatíveis do Expo/React Native.
