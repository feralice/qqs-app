# Ambiente local

## Pré-requisitos

- Node.js 22 ou superior.
- npm 10 ou superior.
- Expo CLI via o script do workspace.
- PostgreSQL local ou uma instância de desenvolvimento.

## Instalação

Na raiz do projeto:

```bash
npm install
```

## Verificações

```bash
npm run typecheck
npm test --workspace=@qqs/backend
npm test --workspace=@qqs/frontend
```

## Backend

```bash
npm run dev --workspace=@qqs/backend
```

A API será preparada para a porta `3333`. A rota inicial é `GET /health`.

## Frontend

```bash
npm start --workspace=@qqs/frontend
```

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

O primeiro `npm install` do Expo reportou vulnerabilidades transitivas. Não executar `npm audit fix --force` sem revisar possíveis atualizações incompatíveis do Expo/React Native.
