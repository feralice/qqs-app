# Técnico: visitas e localização na chegada — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o primeiro fluxo vertical do técnico: listar visitas, abrir detalhes e registrar a chegada uma única vez com localização opcional, funcionando online e offline.

**Architecture:** O backend terá um módulo de visitas com domínio, caso de uso, repositório em memória e rotas Express. O frontend usará telas Expo Router, um cliente HTTP, um adaptador de localização baseado em `expo-location` e a `SyncQueue` existente para salvar a operação antes de tentar sincronizar. Os contratos compartilhados definirão os estados, payloads e respostas usados pelos dois lados.

**Tech Stack:** Expo SDK 57, Expo Router, React Native, TypeScript, `expo-location`, Express 5, testes `node:test` com `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-20-technician-visit-location-design.md`

## Global Constraints

- A localização é capturada somente no momento de registrar a chegada; não usar rastreamento contínuo.
- Permissão de localização negada não bloqueia o registro da chegada.
- A operação local deve ser criada antes da tentativa de rede.
- Retentativas devem usar o mesmo `operationId` e não duplicar a chegada.
- Latitude deve estar entre `-90` e `90`; longitude entre `-180` e `180`.
- O primeiro backend usa repositório em memória; a interface do repositório deve permitir substituição posterior por PostgreSQL.
- O Google Maps será aberto por URL externa com coordenadas; não adicionar chave de API neste incremento.
- A identidade real do usuário fica fora deste incremento; usar um técnico de desenvolvimento explícito no adaptador.

## Review Focus

- Permissão negada: o técnico ainda consegue iniciar a visita e recebe aviso claro — testar no adaptador e na tela de detalhes.
- Operação offline: a visita muda localmente e a operação fica `pending` sem chamada HTTP — testar no caso de uso mobile.
- Retentativa/idempotência: duas chamadas da mesma operação não criam duas chegadas — testar o caso de uso e a rota backend.
- Coordenadas inválidas: o backend rejeita latitude/longitude fora dos limites — testar `400` na rota.
- Visita inexistente ou já iniciada: a API retorna `404` ou mantém resultado idempotente conforme o caso — testar as rotas.

---

### Task 1: Contratos compartilhados do fluxo de visitas

**Files:**
- Modify: `packages/contracts/src/index.ts`
- Modify: `packages/contracts/package.json`
- Test: `packages/contracts/src/index.test.ts`

**Interfaces:**
- Produces `VisitSummary`, `VisitDetails`, `VisitStatus`, `ArrivalLocation`, `StartVisitRequest`, `StartVisitResponse` e `SyncStatus` para backend e frontend.

- [ ] **Step 1: Write the failing test**

Adicionar testes que compilem exemplos válidos de resumo, detalhes e payload de chegada, incluindo `location` opcional e status `assigned`, `in_progress`, `pending_sync` e `sync_failed`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/contracts`

Expected: FAIL because the contracts workspace ainda não possui o script de teste e os tipos não existem.

- [ ] **Step 3: Write minimal implementation**

Adicionar o script `"test": "node --test --import tsx"` e a dependência de desenvolvimento `tsx` ao workspace. Em seguida, adicionar os tipos literais e aliases sem introduzir validação runtime no pacote compartilhado. Manter `VisitStatus` compatível com o domínio existente e representar localização como:

```ts
export type ArrivalLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};
```

- [ ] **Step 4: Run verification**

Run: `npm run typecheck`

Expected: PASS, com os novos contratos consumíveis pelo backend e frontend.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa; este workspace não é um repositório Git, portanto não criar commit.

### Task 2: Domínio e caso de uso backend para iniciar visita

**Files:**
- Modify: `backend/src/modules/visits/domain/visit.ts`
- Modify: `backend/src/modules/visits/application/start-visit.ts`
- Create: `backend/src/modules/visits/application/start-visit.validation.ts`
- Test: `backend/src/modules/visits/application/start-visit.test.ts`

**Interfaces:**
- Consumes `VisitId`, `ClientId`, `UserId` e `ArrivalLocation` dos contratos.
- Produces `startVisit(repository, input): Promise<Visit>` com operação idempotente por `operationId`.

- [x] **Step 1: Write the failing tests**

Estender o teste existente para cobrir: primeira chegada com localização; segunda chamada com o mesmo `operationId` retorna a mesma visita; localização ausente é aceita; latitude, longitude, precisão negativa e data inválida são rejeitadas.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/backend -- backend/src/modules/visits/application/start-visit.test.ts`

Expected: FAIL porque o domínio atual só aceita visita já criada como `in_progress`, não possui localização nem idempotência.

- [x] **Step 3: Write minimal implementation**

Atualizar `Visit` para aceitar `assigned` antes da chegada e guardar `arrivedAt`, `arrivalLocation` e `lastStartOperationId`. Criar validação pura para ISO date, latitude, longitude e accuracy. Alterar `VisitRepository` para buscar por `id` e `operationId`, preservando a mesma visita quando a operação já foi aplicada.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --workspace=@qqs/backend -- backend/src/modules/visits/application/start-visit.test.ts`

Expected: PASS para todos os casos do caso de uso.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa sem commit Git.

### Task 3: Repositório em memória e endpoints REST de visitas

**Files:**
- Create: `backend/src/modules/visits/infrastructure/in-memory-visit-repository.ts`
- Create: `backend/src/modules/visits/presentation/visit-routes.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/src/modules/visits/presentation/visit-routes.test.ts`

**Interfaces:**
- Consumes `VisitRepository` e `startVisit` da Task 2.
- Produces `GET /visits`, `GET /visits/:id`, `POST /visits` e `POST /visits/:id/start`.

- [ ] **Step 1: Write the failing tests**

Criar testes HTTP com `node-mocks-http` para: listar a visita seed; consultar detalhes; criar uma visita; iniciar com `arrivedAt`, coordenadas e `operationId`; retornar `400` para coordenada inválida; retornar `404` para id desconhecido; repetir a mesma operação sem duplicar a chegada.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/backend -- backend/src/modules/visits/presentation/visit-routes.test.ts`

Expected: FAIL porque as rotas e o repositório ainda não existem.

- [ ] **Step 3: Write minimal implementation**

Criar o repositório com uma visita seed determinística (`visit-001`), registrar o router em `createApp()`, converter JSON HTTP para o input do caso de uso e retornar os status definidos na especificação. Usar `operationId` do corpo, sem gerar um novo id para retentativas.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --workspace=@qqs/backend -- backend/src/modules/visits/presentation/visit-routes.test.ts`

Expected: PASS sem alterar o endpoint `/health` existente.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa sem commit Git.

### Task 4: Dependência e adaptador de localização no mobile

**Files:**
- Modify: `frontend/package.json`
- Modify: `package-lock.json`
- Create: `frontend/src/modules/location/location-provider.ts`
- Create: `frontend/src/modules/location/expo-location-provider.ts`
- Modify: `frontend/app.json`
- Test: `frontend/src/modules/location/location-provider.test.ts`

**Interfaces:**
- Produces `LocationProvider` com `getArrivalLocation(): Promise<LocationResult>` e estados `granted`, `denied` e `unavailable`.

- [ ] **Step 1: Write the failing test**

Testar um provider fake que represente localização concedida, permissão negada e indisponibilidade, verificando que a camada de aplicação recebe um resultado estável e não depende de APIs nativas.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/location/location-provider.test.ts`

Expected: FAIL porque a interface e o adaptador ainda não existem.

- [ ] **Step 3: Write minimal implementation**

Instalar `expo-location` com `npx expo install expo-location`. Implementar solicitação de permissão somente dentro de `getArrivalLocation`, fazer uma única chamada de posição e mapear os erros para `denied`/`unavailable`. Atualizar `frontend/app.json` apenas com a configuração necessária de permissões do Expo.

- [ ] **Step 4: Run verification**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/location/location-provider.test.ts`

Expected: PASS; `npm run typecheck` também deve permanecer verde.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa sem commit Git.

### Task 5: Cliente remoto e caso de uso mobile para chegada offline-first

**Files:**
- Create: `frontend/src/modules/visits/visit-api.ts`
- Create: `frontend/src/modules/visits/visit-store.ts`
- Create: `frontend/src/modules/visits/start-visit.ts`
- Modify: `frontend/src/modules/sync/local-operation.ts`
- Modify: `frontend/src/modules/sync/sync-queue.ts`
- Test: `frontend/src/modules/visits/start-visit.test.ts`

**Interfaces:**
- Consumes `LocationProvider`, `SyncQueue` e contratos compartilhados.
- Produces `listVisits()`, `getVisit(id)` e `startVisit({ visitId, now, locationProvider })`.

- [ ] **Step 1: Write the failing tests**

Testar: iniciar com localização cria a operação local antes do envio; iniciar sem localização ainda atualiza o estado; falha de rede mantém `pending`; confirmação muda para `synced`; mesma operação não é enfileirada duas vezes.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/visits/start-visit.test.ts`

Expected: FAIL porque o cliente, store e caso de uso não existem.

- [ ] **Step 3: Write minimal implementation**

Usar `fetch` no cliente HTTP, configurar a base URL por `EXPO_PUBLIC_API_URL` com fallback local para desenvolvimento e criar `operationId` determinístico para a chegada. Atualizar primeiro o store local, enfileirar `visit.start`, tentar enviar e preservar `pending` em erro. O método do Google Maps deve gerar URL `https://www.google.com/maps/search/?api=1&query=latitude,longitude`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/visits/start-visit.test.ts`

Expected: PASS para localização concedida, negada e rede indisponível.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa sem commit Git.

### Task 6: Tela de lista de visitas

**Files:**
- Create: `frontend/src/modules/visits/VisitsScreen.tsx`
- Create: `frontend/src/modules/visits/VisitCard.tsx`
- Modify: `frontend/app/index.tsx`
- Create: `frontend/app/visit/[id].tsx`
- Test: `frontend/src/modules/visits/VisitsScreen.test.tsx`

**Interfaces:**
- Consumes `listVisits()` e navegação do Expo Router.
- Produces navegação para `/visit/[id]` ao tocar em um card.

- [ ] **Step 1: Write the failing test**

Testar que a tela mostra cliente, data, quantidade de sistemas e estado; mostra estado vazio; exibe indicador de operação pendente.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/visits/VisitsScreen.test.tsx`

Expected: FAIL porque a tela ainda é apenas o `AppShell` de boas-vindas.

- [ ] **Step 3: Write minimal implementation**

Substituir o conteúdo principal do `AppShell` pela lista de visitas, mantendo a paleta existente e componentes simples de React Native. Adicionar `frontend/app/visit/[id].tsx` como rota de detalhes e configurar o card para navegar pelo id.

- [ ] **Step 4: Run verification**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/visits/VisitsScreen.test.tsx`

Expected: PASS e `npx expo start --tunnel --clear` deve continuar reconhecendo as rotas.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa sem commit Git.

### Task 7: Tela de detalhes e registro de chegada

**Files:**
- Modify: `frontend/app/visit/[id].tsx`
- Create: `frontend/src/modules/visits/VisitDetailsScreen.tsx`
- Create: `frontend/src/modules/visits/ArrivalStatus.tsx`
- Test: `frontend/src/modules/visits/VisitDetailsScreen.test.tsx`

**Interfaces:**
- Consumes `getVisit(id)`, `startVisit()` e `LocationProvider`.
- Produces ação de chegada, mensagens de permissão/rede e link externo do Google Maps.

- [ ] **Step 1: Write the failing test**

Testar: exibição dos dados da visita; botão disponível apenas para visita `assigned`; localização concedida mostra confirmação e mapa; permissão negada mostra aviso não bloqueante; rede indisponível mostra “salvo no dispositivo”.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/visits/VisitDetailsScreen.test.tsx`

Expected: FAIL porque a rota ainda não possui a tela de detalhes.

- [ ] **Step 3: Write minimal implementation**

Implementar a tela com `Pressable`, estados de carregamento e erro, botão “Registrar chegada” e botão “Abrir localização no Google Maps” somente quando houver coordenadas. Usar `Linking.openURL` com a URL gerada pelo caso de uso e nunca bloquear a chegada por falta de localização.

- [ ] **Step 4: Run verification**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/visits/VisitDetailsScreen.test.tsx`

Expected: PASS; testar também manualmente no Expo Go concedendo e negando a permissão.

- [ ] **Step 5: Checkpoint**

Registrar o diff da tarefa sem commit Git.

### Task 8: Integração de sincronização e validação final do slice

**Files:**
- Modify: `frontend/src/modules/sync/sync-queue.ts`
- Modify: `frontend/src/modules/sync/sync-queue.test.ts`
- Modify: `README.md`
- Modify: `docs/desenvolvimento/ambiente-local.md`

**Interfaces:**
- Consumes operações `visit.start` produzidas pela Task 5.
- Produces documentação de execução e fluxo de sincronização verificável.

- [x] **Step 1: Write the failing tests**

Adicionar casos para processar uma operação `visit.start`, confirmar `synced`, manter `failed` quando a API falhar e reenviar sem criar outro `operationId`.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test --workspace=@qqs/frontend -- frontend/src/modules/sync/sync-queue.test.ts`

Expected: FAIL porque a fila atual apenas armazena e confirma operações, sem processador remoto.

- [x] **Step 3: Write minimal implementation**

Adicionar um processador injetável de operações que receba `visit.start`, chame o cliente remoto e marque `synced` ou `failed`, sem apagar a operação. Documentar as variáveis de desenvolvimento e os comandos para subir backend/frontend.

- [x] **Step 4: Run the full verification**

Run: `npm run typecheck && npm test --workspace=@qqs/backend && npm test --workspace=@qqs/frontend`

Expected: typecheck e todos os testes existentes e novos passam.

- [ ] **Step 5: Manual verification**

Subir `npx tsx backend/src/server.ts` e `npm start --workspace=@qqs/frontend -- --tunnel`, abrir a visita seed no Expo Go, registrar chegada com permissão concedida, repetir sem rede, restaurar a rede, conferir `/health` e abrir o link do Google Maps.

- [x] **Step 6: Checkpoint**

Registrar o diff final; não criar commit porque o workspace não é um repositório Git.

## Self-review do plano

- Todos os itens da especificação têm tarefas: telas nas Tasks 6–7, API nas Tasks 2–3, localização na Task 4, offline/sincronização nas Tasks 5 e 8, testes em cada camada.
- Não há placeholders `TBD`, `TODO` ou instruções sem arquivo/comando associado.
- Os nomes `VisitStatus`, `ArrivalLocation`, `LocationProvider`, `startVisit` e `visit.start` são definidos antes de serem consumidos por tarefas posteriores.
- Os riscos principais — permissão negada, offline, idempotência, coordenadas inválidas e visitas inexistentes — aparecem no Review Focus e têm testes atribuídos.
- A dependência de Google Maps não exige SDK nativo nem chave de API neste primeiro incremento; a captura usa `expo-location` e a abertura usa URL externa.
