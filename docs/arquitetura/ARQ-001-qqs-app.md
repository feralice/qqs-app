# Arquitetura de Software — QQS App

**Versão:** 0.1  
**Status:** Base aprovada para implementação inicial

## Decisão

O QQS App será um monólito modular com Clean Architecture no backend e uma aplicação React Native/Expo offline-first no mobile.

## Componentes

```text
Frontend — Expo/React Native
  ├─ UI e navegação
  ├─ casos de uso do dispositivo
  ├─ SQLite local
  └─ fila de sincronização
          │ REST/JSON
          ▼
Backend — Express/TypeScript
  ├─ módulos de negócio
  ├─ autenticação/autorização
  ├─ casos de uso
  ├─ PostgreSQL
  ├─ armazenamento de arquivos
  └─ geração de PDF
```

## Mobile

O banco local é a fonte de leitura e escrita durante o preenchimento de uma visita. A interface não dependerá de uma chamada de rede para salvar respostas. Cada alteração relevante gera uma operação idempotente na fila local. A sincronização será retomável e exibirá ao usuário os estados `pending`, `syncing`, `synced` e `failed`.

A identidade visual do frontend seguirá a paleta fornecida:

- Azul corporativo: `#0876C9` — cabeçalho e navegação principal.
- Azul-claro: `#B9DDF8` — fundos e superfícies suaves.
- Verde-água: `#72BAB8` — contato e detalhes de botões.
- Branco: `#FFFFFF` — fundos, textos do cabeçalho e botões.
- Cinza quase preto: `#242424` — rodapé e áreas de alto contraste.
- Cinza-escuro: `#383838` — títulos e textos principais.

O app será organizado por módulos de negócio, com separação entre apresentação, casos de uso, persistência local e integração remota. O armazenamento local usará SQLite; dados sensíveis de sessão ficarão em armazenamento seguro do dispositivo.

## Backend

O backend será dividido por módulos (`auth`, `users`, `clients`, `systems`, `checklists`, `visits`, `reports` e `sync`). Cada módulo poderá conter `domain`, `application`, `infrastructure` e `presentation`.

As regras de negócio não dependerão de Express, Prisma ou serviços externos. Controllers converterão HTTP em comandos de aplicação; repositórios e adaptadores serão implementações de portas definidas pela aplicação.

## Persistência e arquivos

PostgreSQL será a fonte oficial dos dados sincronizados. Drizzle ORM será usado como adaptador de persistência, com schema TypeScript e migrações SQL versionadas. Fotos, assinaturas e PDFs ficarão em armazenamento de objetos; o banco guardará metadados e referências.

## Sincronização

O mobile criará UUIDs no dispositivo. O backend usará esses identificadores e chaves de idempotência para que retentativas não dupliquem visitas, respostas ou assinaturas. Uma visita ficará editável localmente até ser encerrada; depois de sincronizada, alterações posteriores exigirão uma nova versão ou revisão autorizada.

## Segurança

O acesso usará autenticação por e-mail ou telefone, com senha no MVP. A API emitirá access token de curta duração e refresh token revogável. Toda rota verificará autenticação e autorização por perfil. Senhas serão armazenadas com hash forte.

## PDF e assinatura

O backend montará o relatório a partir dos dados persistidos, incluindo cliente, sistemas, respostas, horários, participantes, observações e assinatura. A assinatura do MVP será uma confirmação desenhada na tela do dispositivo; requisitos jurídicos adicionais permanecem em aberto.

## Decisões adiadas

- GPS obrigatório ou opcional.
- Serviço de SMS para autenticação por telefone.
- Edição de modelos de checklist pelo próprio app.
- Política para edição/revisão de visitas já sincronizadas.
- Provedor definitivo de armazenamento de objetos.
