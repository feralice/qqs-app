# ADR 0004: Drizzle, PostgreSQL e PGlite local

Status: adotada. Data: 2026-10-05.

## Contexto

A persistência precisa de SQL e migrações versionadas, com uma experiência local que não exija Docker para começar. Testes devem executar queries reais sem depender de um servidor externo.

## Decisão

Usar Drizzle ORM sobre PostgreSQL quando `DATABASE_URL` estiver definida e PGlite quando não estiver. O schema fica em `infrastructure/db/schema.ts`; migrações SQL e snapshots ficam em `backend/drizzle`. A inicialização aplica as migrações nos dois modos.

Testes usam PGlite em memória. Desenvolvimento local grava em `PGLITE_DATA_DIR`. O seed com contas conhecidas só roda fora de produção e, no PostgreSQL, exige `SEED_DEV_DATA=true`. `JWT_SECRET` é obrigatório com `DATABASE_URL`.

## Consequências

Queries e migrações são exercitadas em um motor compatível com PostgreSQL. PGlite não substitui testes de concorrência, conexões e operação num PostgreSQL de produção. `drizzle-kit check` valida o histórico, mas a correspondência com o schema exige geração e revisão das migrações.
