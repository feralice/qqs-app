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

Para usar uma API acessível por outro dispositivo na rede local, defina
`EXPO_PUBLIC_API_URL`. Sem essa variável, o frontend usa
`http://127.0.0.1:3333`.

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:3333 npm start --workspace=@qqs/frontend
```

O backend usa PostgreSQL como banco planejado e Drizzle ORM como camada de persistência. A configuração do banco será adicionada no próximo incremento.
