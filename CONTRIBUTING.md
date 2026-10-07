# Como contribuir

Use Node.js 22 e npm 10 ou superior. Instale o monorepo com `npm ci`. A configuração local e as contas de desenvolvimento estão em [ambiente local](docs/desenvolvimento/ambiente-local.md).

## Fluxo de trabalho

1. Leia os requisitos e o plano da tarefa em `docs/superpowers`. Confirme o estado atual antes de repetir trabalho.
2. Crie uma branch com escopo claro, como `feat/<tema>`, `fix/<tema>` ou `docs/<tema>`. Preserve alterações existentes.
3. Para alterar comportamento, escreva primeiro um teste que reproduza o problema ou requisito e observe a falha.
4. Implemente na camada adequada e verifique tipos, testes e migrações. Revise o diff, incluindo arquivos novos.
5. Abra um pull request descrevendo problema, resultado, comandos executados e limitações.

## Verificações

```bash
npm run typecheck:all
npm test
npm run db:check --workspace=@qqs/backend
npm run test:coverage --workspace=@qqs/backend
```

Mudanças de schema exigem `npm run db:generate --workspace=@qqs/backend`, revisão do SQL e teste das migrações. Para mudanças de HTTP, atualize schemas, contratos e respostas documentadas; confira `/docs/` e `/openapi.json` com o servidor real.

## Convenções

- Use Conventional Commits: `feat(visits): ...`, `fix(admin): ...`, `docs: ...` ou `ci: ...`.
- Comentários são poucos, em português, e explicam motivos que o código não deixa claros.
- O caractere Unicode U+2014 não deve aparecer em textos ou comentários novos. Varie a forma dos itens em listas.
- Dependências do núcleo respeitam `backend/src/architecture.test.ts`; regras de negócio não pertencem aos handlers Express.
- Não inclua credenciais, tokens, banco local ou arquivos de ambiente no pull request.

Agentes de IA seguem [CLAUDE.md](CLAUDE.md). A dona do projeto precisa pedir explicitamente qualquer commit; nunca adicionar IA como coautora.

## Checklist de PR

- [ ] O comportamento atende ao requisito e tem teste adequado.
- [ ] Rodei as verificações e registrei os resultados.
- [ ] Contratos, OpenAPI e migrações acompanham a mudança quando aplicável.
- [ ] Documentei decisões e pendências sem apresentar funcionalidades planejadas como prontas.
