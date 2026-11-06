# Plano: catálogo de produtos e programa de tratamento

Spec: `docs/superpowers/specs/2026-10-20-programa-tratamento-design.md`
Branch: `feat/programa-tratamento`

Cada tarefa segue TDD: escrever o teste, ver falhar, implementar, ver passar.

## Tarefas

- [x] 1. Contracts: tipos `Product`, `ProductUnit`, `ControlParameter`, `ProgramProduct`, `SystemProgram`, `ClientProgram` e requests.
- [x] 2. Domínio `domain/products`: validação de produto (nome, unidade) e de programa (faixa, doses, duplicidade).
- [x] 3. Schema Drizzle: tabelas `products`, `system_parameters`, `system_products`; migração gerada e revisada; `test-database` truncando as novas tabelas.
- [x] 4. Repositórios Drizzle de produto e de programa (substituição em transação).
- [x] 5. Casos de uso: `createProduct`, `updateProduct`, `listProducts`, `getClientProgram`, `replaceSystemProgram` (sistema precisa ser do cliente; produto novo precisa estar ativo).
- [x] 6. Rotas e schemas Zod (`presentation/routes/products`, rota de programa em clients), registro no `app.ts`, testes HTTP de permissão e validação.
- [x] 7. Seed: produtos da linha QQS citados na ENT-001 e um programa de exemplo na Gases da Amazônia.
- [x] 8. Frontend: `product-api`, `ProductsScreen`, rota `/admin/products`, atalho no painel.
- [x] 9. Frontend: `program-api`, `ProgramScreen` com editor por sistema, rota `/admin/clients/[id]/program`, botão no cartão da empresa.
- [x] 10. Verificação final: `typecheck:all`, testes dos três workspaces, `db:check`, revisão do diff.

## Progresso

- 20/10/2026: tarefas 1 a 7 concluídas. Backend com 142 testes verdes, typecheck e `db:check` ok. Migração `0002_programa_tratamento.sql` revisada.
- 20/10/2026: tarefas 8 a 10 concluídas. Frontend com 136 testes verdes, contracts 10, backend 142, `typecheck:all` e `db:check` ok. Revisão aplicada: erro ao inativar produto, bloqueio de salvamento duplo, chave estável nas linhas de parâmetro.
- Pendências conhecidas: nome repetido em duas criações simultâneas devolve 500 em vez de 409 (o cadastro de CNPJ tem o mesmo comportamento); a verificação de produto inativo roda fora da transação do PUT. Com dois diretores editando, o risco é baixo.
- Falta revisão visual no app rodando.
