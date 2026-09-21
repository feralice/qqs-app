# QQS App

Aplicativo mobile para visitas técnicas e checklists, com operação offline e backend separado.

## Estrutura

- `frontend/`: React Native/Expo mobile.
- `backend/`: Express/TypeScript API.
- `packages/contracts/`: tipos compartilhados.
- `docs/`: requisitos, arquitetura e planos.

## Comandos

```bash
npm install
npm run typecheck
npm test --workspace=@qqs/backend
npm test --workspace=@qqs/frontend
```

## Desenvolvimento

```bash
npm run dev --workspace=@qqs/backend
npm start --workspace=@qqs/frontend
```

O backend usa PostgreSQL como banco planejado e Drizzle ORM como camada de persistência. A configuração do banco será adicionada no próximo incremento.
