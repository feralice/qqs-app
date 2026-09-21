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

Para apontar o app para outra API durante o desenvolvimento, configure
`EXPO_PUBLIC_API_URL`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:3333 npm start --workspace=@qqs/frontend
```

Se a variável não for definida, o cliente usa `http://127.0.0.1:3333`.

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
