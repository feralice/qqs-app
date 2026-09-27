# Painel administrativo offline-first Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um painel administrativo mobile com resumo operacional, ações offline, histórico filtrável e notificações de eventos críticos.

**Architecture:** Evoluir o `AdminHomeScreen` sobre contratos compartilhados e separar agregação de métricas, ações administrativas, persistência local e notificações. O backend será a fonte autoritativa; o frontend manterá cache e fila idempotente para operar offline.

**Tech Stack:** React Native/Expo, TypeScript, Express, Drizzle ORM/PostgreSQL, Vitest/Jest conforme configuração existente, contratos compartilhados em `packages/contracts`.

**Spec:** `docs/superpowers/specs/2026-09-27-admin-dashboard-offline-design.md`

## Global Constraints

- O uso prioritário é em celular.
- Vários administradores têm o mesmo nível de acesso.
- O dashboard deve funcionar offline e mostrar estado de sincronização.
- Ações offline não podem ser apresentadas como confirmadas no servidor.
- Operações administrativas devem ser idempotentes por `operationId`.
- Push cobre eventos operacionais; WhatsApp automático cobre apenas atrasos e problemas.
- O dashboard deve diferenciar zero resultados de dados ainda não carregados.
- Não adicionar dependência de provedor WhatsApp nesta etapa; encapsular a integração atrás de uma porta.

## Review Focus

- Dados locais antigos: mostrar `lastUpdatedAt` e não tratar cache como confirmação do servidor; testar em `frontend/src/modules/admin/AdminDashboardData.test.ts`.
- Ação duplicada após retry: preservar um único efeito por `operationId`; testar em `frontend/src/modules/sync/sync-queue.test.ts` e no backend.
- Conflito entre alteração local e servidor: sinalizar conflito sem sobrescrever silenciosamente; testar no serviço de sincronização.
- Falha de notificação: registrar falha e permitir retry sem duplicar entrega; testar no serviço de eventos.
- Resumo sem visitas versus resumo ainda carregando: usar estados distintos; testar o componente do dashboard.

### Task 1: Contratos e agregação do resumo operacional

**Files:**
- Modify: `packages/contracts/src/index.ts`
- Test: `packages/contracts/src/index.test.ts`
- Create: `backend/src/modules/admin/application/get-admin-dashboard.ts`
- Test: `backend/src/modules/admin/application/get-admin-dashboard.test.ts`
- Modify: `backend/src/modules/visits/infrastructure/in-memory-visit-repository.ts` (ou repositório equivalente usado pelos testes)

**Interfaces:**
- Produces `AdminDashboardSummary`, `AdminAlertSummary`, `EmployeeOperationalStatus` e `GetAdminDashboard(date: string): Promise<AdminDashboardSummary>`.
- `AdminDashboardSummary` contém contagens de `scheduled`, `inProgress`, `completed`, `overdue`, lista de alertas, técnicos e `lastUpdatedAt`.

- [ ] Escrever testes para contagens por status, atrasos baseados em `scheduledFor`, técnicos sem visitas e diferença entre lista vazia e ausência de dados.
- [ ] Rodar `npm test --workspace=@qqs/contracts -- index.test.ts` e o teste backend novo; confirmar falha antes da implementação.
- [ ] Implementar os tipos compartilhados e o caso de uso de agregação usando o repositório existente, sem colocar regras de negócio no componente React.
- [ ] Rodar `npm test --workspace=@qqs/backend` e `npm run typecheck`; confirmar PASS.

### Task 2: Endpoint e ações administrativas idempotentes

**Files:**
- Create: `backend/src/modules/admin/application/admin-actions.ts`
- Test: `backend/src/modules/admin/application/admin-actions.test.ts`
- Create: `backend/src/modules/admin/presentation/admin-routes.ts`
- Test: `backend/src/modules/admin/presentation/admin-routes.test.ts`
- Modify: `backend/src/app.ts`
- Modify: `packages/contracts/src/index.ts`

**Interfaces:**
- Produces `rescheduleVisit(input: { visitId: string; scheduledFor: string; operationId: string })`.
- Produces `reassignVisit(input: { visitId: string; employeeId: string; operationId: string })`.
- Produces `resolveAlert(input: { alertId: string; operationId: string })`.
- Produces `GET /admin/dashboard?date=YYYY-MM-DD`, `POST /admin/visits/:id/reschedule`, `POST /admin/visits/:id/reassign` e `POST /admin/alerts/:id/resolve`.

- [ ] Escrever testes de rota para autenticação, payload inválido, sucesso e repetição do mesmo `operationId`.
- [ ] Rodar os testes novos e confirmar falhas esperadas.
- [ ] Implementar os casos de uso com persistência de operação processada e respostas determinísticas para retries.
- [ ] Registrar as rotas em `backend/src/app.ts` seguindo o padrão de autenticação existente.
- [ ] Rodar `npm test --workspace=@qqs/backend` e `npm run typecheck`.

### Task 3: Dashboard mobile e estados de carregamento

**Files:**
- Modify: `frontend/src/modules/admin/AdminHomeScreen.tsx`
- Modify: `frontend/src/modules/admin/AdminHomeScreen.styles.ts`
- Create: `frontend/src/modules/admin/AdminDashboardSummary.tsx`
- Test: `frontend/src/modules/admin/AdminDashboardSummary.test.tsx`
- Create: `frontend/src/modules/admin/admin-api.ts`
- Test: `frontend/src/modules/admin/admin-api.test.ts`

**Interfaces:**
- `AdminDashboardSummary({ summary, isLoading, isStale, onOpenAlert, onOpenVisit })` renderiza resumo, alertas e estado dos dados.
- `fetchAdminDashboard(date: string): Promise<AdminDashboardSummary>` consome o endpoint da Task 2.

- [ ] Escrever testes para loading, zero visitas, dados antigos, contadores, alertas e ações rápidas.
- [ ] Rodar os testes frontend novos e confirmar falhas esperadas.
- [ ] Implementar o componente de resumo e integrá-lo acima da agenda atual, preservando o agendamento existente.
- [ ] Adicionar filtros/atalhos móveis sem depender de quantidade fixa de visitas.
- [ ] Rodar `npm test --workspace=@qqs/frontend` e `npm run typecheck`.

### Task 4: Persistência local e fila de ações administrativas

**Files:**
- Modify: `frontend/src/modules/sync/local-operation.ts`
- Modify: `frontend/src/modules/sync/sync-queue.ts`
- Test: `frontend/src/modules/sync/sync-queue.test.ts`
- Create: `frontend/src/modules/sync/local-cache.ts`
- Test: `frontend/src/modules/sync/local-cache.test.ts`
- Modify: `frontend/src/modules/visits/visit-store.ts`
- Create: `frontend/src/modules/admin/admin-offline-actions.ts`
- Test: `frontend/src/modules/admin/admin-offline-actions.test.ts`

**Interfaces:**
- `LocalCache<T>.read(key: string): Promise<T | undefined>` e `write(key: string, value: T): Promise<void>`.
- `enqueueAdminAction(action: AdminAction): LocalOperation`.
- `syncAdminActions(processor: OperationProcessor): Promise<SyncResult>`.

- [ ] Escrever testes de persistência/restauração do cache, status pending/syncing/synced/failed e retry.
- [ ] Escrever teste de idempotência para não enfileirar duas vezes o mesmo `operationId`.
- [ ] Implementar armazenamento persistente compatível com Expo sem quebrar os testes existentes; manter adaptador substituível.
- [ ] Implementar ações de reagendar, reatribuir e resolver alerta como operações enfileiráveis.
- [ ] Implementar sinalização de conflito em vez de sobrescrita silenciosa.
- [ ] Rodar toda a suíte frontend e `npm run typecheck`.

### Task 5: Histórico filtrável

**Files:**
- Modify: `packages/contracts/src/index.ts`
- Create: `backend/src/modules/admin/application/search-visit-history.ts`
- Test: `backend/src/modules/admin/application/search-visit-history.test.ts`
- Modify: `backend/src/modules/admin/presentation/admin-routes.ts`
- Create: `frontend/src/modules/admin/AdminHistoryScreen.tsx`
- Test: `frontend/src/modules/admin/AdminHistoryScreen.test.tsx`
- Create: `frontend/src/modules/admin/admin-history-api.ts`

**Interfaces:**
- `searchVisitHistory(filters: { from: string; to: string; employeeId?: string; status?: VisitStatus; clientId?: string }): Promise<VisitHistoryPage>`.
- `GET /admin/history?from=&to=&employeeId=&status=&clientId=`.

- [ ] Escrever testes para cada filtro, combinação de filtros, página vazia e detalhes de uma visita.
- [ ] Implementar consulta do backend com limites/paginação e ordenação por data decrescente.
- [ ] Implementar tela mobile com filtros compactos e estado offline explícito.
- [ ] Integrar entrada para o histórico ao dashboard.
- [ ] Rodar testes backend/frontend e typecheck.

### Task 6: Eventos, push e porta de WhatsApp

**Files:**
- Create: `backend/src/modules/notifications/application/notification-service.ts`
- Test: `backend/src/modules/notifications/application/notification-service.test.ts`
- Create: `backend/src/modules/notifications/application/notification-ports.ts`
- Modify: `backend/src/modules/visits/application/start-visit.ts`
- Modify: `backend/src/modules/visits/application/finish-visit.ts`
- Modify: `backend/src/modules/admin/application/admin-actions.ts`
- Create: `frontend/src/modules/notifications/push-token.ts`
- Test: `frontend/src/modules/notifications/push-token.test.ts`

**Interfaces:**
- `NotificationPort.sendPush(input: PushNotification): Promise<DeliveryResult>`.
- `WhatsAppPort.sendCriticalAlert(input: CriticalAlert): Promise<DeliveryResult>`.
- `NotificationService.publish(event: OperationalEvent): Promise<void>`.

- [ ] Escrever testes para push em todos os eventos definidos e WhatsApp somente para `visit_overdue` e `visit_problem`.
- [ ] Escrever teste de deduplicação por `eventId` e de falha/retry.
- [ ] Implementar portas sem acoplar o domínio a um provedor externo; usar adaptador fake nos testes.
- [ ] Integrar publicação aos casos de uso de início, finalização, alteração e problema de visita.
- [ ] Registrar tokens dos administradores e selecionar todos os destinatários autorizados.
- [ ] Rodar testes completos e typecheck; documentar o provedor real como configuração posterior.

### Task 7: Verificação integrada e entrega

**Files:**
- Modify: `README.md`
- Create: `docs/desenvolvimento/admin-dashboard-offline.md`
- Modify: `backend/src/shared/http/health-route.test.ts` (se necessário para dependências de infraestrutura)

- [ ] Executar `npm run typecheck`.
- [ ] Executar `npm test --workspace=@qqs/backend`.
- [ ] Executar `npm test --workspace=@qqs/frontend`.
- [ ] Testar manualmente: abrir dashboard, simular offline, reagendar, restaurar conexão, confirmar sincronização e filtrar histórico.
- [ ] Documentar variáveis de ambiente, comportamento offline e limitações do WhatsApp.
- [ ] Registrar no README a ordem de entrega e os comandos de verificação.

> Este workspace não é um repositório Git; portanto, os checkpoints de commit do fluxo padrão não se aplicam.
