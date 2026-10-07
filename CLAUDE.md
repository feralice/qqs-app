# Guia do projeto QQS App

## Visão geral

Monorepo TypeScript para visitas técnicas, empresas, agenda e administração. O frontend é React Native/Expo com versão web e fila offline; o backend é Express com Clean Architecture, PostgreSQL/Drizzle e PGlite local. `packages/contracts` contém os tipos e validações compartilhados.

Consulte `README.md`, `docs/requisitos/RS-001-qqs-app-v0.2.md`, `docs/arquitetura/ARQ-001-qqs-app.md` e `docs/adr/README.md`. Requisitos pendentes de checklist, assinatura, PDF e armazenamento de fotos não devem ser inventados.

## Mapa do código

- `backend/src/domain`: entidades, invariantes e erros por categoria em `common/errors.ts`.
- Os casos de uso ficam em `backend/src/application`, organizados por negócio, com `commands`, `queries` e ports. Há interfaces comuns para relógio, idempotência e exportação tabular.
- `backend/src/infrastructure` implementa banco e repositórios Drizzle, JWT, bcrypt, CSV, relógio e Pino.
- A camada `backend/src/presentation` contém HTTP, rotas e schemas Zod. `app.ts` é o composition root; `server.ts` carrega configuração, abre o banco e inicia o servidor.
- `backend/src/test-support` fornece fakes e helpers HTTP; o frontend usa `frontend/setup-tests.cjs` para adaptar dependências nativas ao runner Node.
- `frontend/app` define navegação e `frontend/src/modules` reúne `auth`, `clients`, `visits`, `admin`, `location` e `sync`.

## Regra de dependência

`domain` importa apenas o próprio domínio e `@qqs/contracts`. `application` depende de domínio, aplicação, contratos e módulos nativos do Node. `infrastructure` implementa ports da aplicação. `presentation` conhece as outras camadas para compor e adaptar HTTP.

`backend/src/architecture.test.ts` verifica imports estáticos entre camadas e dependências externas. Não adicionar Express, Zod ou Drizzle ao núcleo. Esse teste não substitui revisão de imports dinâmicos e efeitos colaterais.

Regras de negócio pertencem ao domínio ou ao caso de uso: CNPJ válido, coordenadas permitidas, raio positivo, visibilidade por perfil e transições da visita. Formato HTTP pertence aos schemas de apresentação: tipos, datas ISO e campos obrigatórios. O handler central converte `AppError.kind` em status; o domínio não conhece códigos HTTP.

## Criar uma rota

Defina o caso de uso e seu teste antes de escrever a rota. Crie os schemas em `presentation/routes/<area>` e confira compatibilidade com contracts usando `satisfies z.ZodType<T>` quando houver um contrato compartilhado. Registre por `api.route`:

```typescript
api.route(
  {
    method: "get",
    path: "/clients/:id",
    tag: "Empresas",
    access: "authenticated",
    summary: "Detalhe de uma empresa.",
    responses: { 200: { description: "Empresa.", schema: ClientSummarySchema }, 404: errorResponses.notFound },
  },
  async ({ params }, response) => {
    response.json(await getClient(repository, params.id));
  },
);
```

`access` é obrigatório: `public`, `authenticated` ou `supervisor`. O registro aplica guards e valida `body`/`query`. Schemas das respostas alimentam a documentação; não são uma validação automática do retorno. Use presenters para impedir vazamento de campos internos. O OpenAPI 3.1 é gerado das mesmas definições e servido em `/openapi.json`; Swagger UI fica em `/docs/`. Schemas com `.meta({ id })` viram componentes reutilizáveis, com sufixo `Input` para entrada.

Injete `Clock` para padrões que dependem da data. Comportamentos idempotentes precisam de ids estáveis nas retentativas; consulte a ADR correspondente antes de ampliar esse mecanismo.

## Comandos

Execute na raiz:

```bash
npm ci
npm run dev:backend
npm run dev:web
npm run typecheck:all
npm test --workspace=@qqs/contracts
npm test --workspace=@qqs/backend
npm test --workspace=@qqs/frontend
npm run test:coverage --workspace=@qqs/backend
npm run db:check --workspace=@qqs/backend
```

Após mudar `backend/src/infrastructure/db/schema.ts`, execute `npm run db:generate --workspace=@qqs/backend`, revise o SQL e teste as migrações. `db:check` não detecta sozinho divergência entre schema TypeScript e SQL. Não editar migrações já aplicadas para esconder uma alteração.

## Convenções e trabalho com IA

- Não commitar sem pedido explícito da dona do projeto. Nunca adicionar IA como coautora de commit.
- Use português nos documentos e nos poucos comentários necessários; comentários devem explicar o porquê não óbvio.
- O caractere Unicode U+2014 é proibido em textos, documentos e comentários. Reescreva com dois-pontos ou outra pontuação.
- Em listas, varie a forma gramatical dos itens e evite começar todos com substantivos terminados em "-ção".
- Commits, quando autorizados, seguem Conventional Commits, por exemplo `fix(admin): omitir filtros vazios no histórico`.
- Preserve alterações anteriores e não faça reset, limpeza ou stage amplo para organizar o trabalho.
- Specs e planos ficam em `docs/superpowers`. Leia o plano indicado e registre progresso antes de retomar tarefas.
- Para mudanças de comportamento, escreva um teste de regressão, observe a falha e só então implemente. Rode testes e typechecks dos projetos afetados.
- Revise o diff completo, incluindo arquivos novos, antes de solicitar um commit. Informe verificações reais e pendências; não declare testes ou revisão visual que não executou.
- Senhas, tokens e dados locais não devem aparecer em logs, fixtures reais ou arquivos versionados.

O CI em `.github/workflows/ci.yml` usa Node 22 e `npm ci`, verifica os três projetos, testa os workspaces, confere migrações e guarda a cobertura do backend. ESLint ainda não está configurado; `lint` é apenas uma conferência de tipos.
