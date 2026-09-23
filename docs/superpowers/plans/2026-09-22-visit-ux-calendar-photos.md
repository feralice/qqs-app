# Evolução de UI/UX, Calendário, Check-in/Check-out e Evidências — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implementar o calendário semanal no topo, check-in com mapa ao vivo e botão "OK", cronômetro, seleção de equipe acompanhante, descrição de serviço, fotos de evidências com legendas, check-out com localização de saída, e agendamento/auditoria para o administrador com Clean Code e alta fidelidade visual.

**Architecture:** A solução estende os contratos em `@qqs/contracts`, atualiza a camada de aplicação e rotas no `@qqs/backend` (Express com Fastify/Node test runner), e refatora o frontend Expo/React Native em componentes modulares e desacoplados (`WeekCalendarStrip`, `LocationMap`, `StaffPicker`, `PhotoEvidencePicker`, `ServiceReportCard`, `AdminScheduleModal`) com suporte offline resiliente em `VisitStore` e `SyncQueue`.

**Tech Stack:** TypeScript, React Native / Expo, Expo Router, Node.js Test Runner (`node --test`), Express, Drizzle ORM.

**Spec:** `docs/superpowers/specs/2026-09-22-visit-ux-calendar-photos-design.md`

## Global Constraints

- Monorepo com workspaces: `packages/contracts`, `backend`, `frontend`.
- Testes executados com `node --test --import tsx` em cada workspace.
- Tipagem TypeScript estrita sem `any` implícito ou `// @ts-ignore` desnecessário.
- Cores corporativas QQS: `corporateBlue` (`#0876C9`), `lightBlue` (`#B9DDF8`), `aqua` (`#72BAB8`), `white` (`#FFFFFF`), `nearBlack` (`#242424`), `darkGray` (`#383838`).
- Componentes com separação clara entre lógica (`.tsx`), estilos (`.styles.ts`) e testes (`.test.tsx` / `.test.ts`).

---

### Task 1: Atualização dos Contratos (`@qqs/contracts`)

**Files:**
- Modify: `packages/contracts/src/index.ts`
- Modify: `packages/contracts/src/index.test.ts`

**Interfaces:**
- Produces: `EmployeeSummary`, `VisitPhoto`, `VisitDeparture`, `CreateVisitRequest`, atualizações em `VisitDetails` e `FinishVisitRequest`.

- [x] **Step 1: Escrever teste com os novos tipos e validações de contrato**

Editar `packages/contracts/src/index.test.ts`:
```typescript
import { test } from "node:test";
import assert from "node:assert/strict";

import type {
  EmployeeSummary,
  FinishVisitRequest,
  VisitDeparture,
  VisitDetails,
  VisitPhoto,
  CreateVisitRequest,
} from "./index.js";

test("visit contracts describe summaries, details, arrival, departure, photos and attendants", () => {
  const photo: VisitPhoto = {
    id: "photo-1",
    uri: "data:image/jpeg;base64,...",
    caption: "Torre 1 tratada",
    takenAt: "2026-09-22T14:30:00.000Z",
  };

  const attendant: EmployeeSummary = {
    id: "emp-2",
    name: "Carlos Silva",
    email: "carlos@qqs.com",
    role: "employee",
  };

  const departure: VisitDeparture = {
    leftAt: "2026-09-22T15:00:00.000Z",
    location: {
      latitude: -3.10194,
      longitude: -60.025,
      accuracy: 5,
    },
  };

  const details: VisitDetails = {
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-22T13:00:00.000Z",
    status: "completed",
    systemsCount: 1,
    systems: [{ id: "sys-1", name: "Torre 1", type: "tower" }],
    arrival: {
      arrivedAt: "2026-09-22T13:10:00.000Z",
      location: { latitude: -3.1019, longitude: -60.025 },
    },
    departure,
    durationMinutes: 110,
    description: "Inspeção completa e dosagem química realizada.",
    attendants: [attendant],
    photos: [photo],
    syncStatus: "synced",
    finishedAt: "2026-09-22T15:00:00.000Z",
  };

  const finishRequest: FinishVisitRequest = {
    operationId: "op-finish-1",
    finishedAt: "2026-09-22T15:00:00.000Z",
    location: departure.location,
    description: "Serviço finalizado com sucesso.",
    attendantIds: ["emp-2"],
    photos: [photo],
  };

  const createRequest: CreateVisitRequest = {
    clientId: "client-001",
    employeeId: "emp-1",
    scheduledFor: "2026-09-23T09:00:00.000Z",
    systems: [{ id: "sys-1", name: "Torre 1", type: "tower" }],
  };

  assert.equal(details.id, "visit-001");
  assert.equal(details.photos?.[0].caption, "Torre 1 tratada");
  assert.equal(finishRequest.operationId, "op-finish-1");
  assert.equal(createRequest.systems[0].name, "Torre 1");
});
```

- [x] **Step 2: Executar teste para verificar que falha por falta de tipos**

Run: `npm test --workspace=@qqs/contracts`  
Expected: FAIL com erros de tipo (ex: `EmployeeSummary`, `VisitPhoto` inexistentes).

- [x] **Step 3: Implementar novos tipos em `packages/contracts/src/index.ts`**

Adicionar as definições em `packages/contracts/src/index.ts`:
```typescript
export type UserId = string;
export type ClientId = string;
export type VisitId = string;
export type OperationId = string;

export type UserRole = "employee" | "supervisor";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type VisitStatus =
  | "assigned"
  | "draft"
  | "in_progress"
  | "completed"
  | "synced"
  | "pending_sync"
  | "sync_failed";

export type ArrivalLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type EmployeeSummary = {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
};

export type VisitPhoto = {
  id: string;
  uri: string;
  caption?: string;
  takenAt: string;
};

export type VisitDeparture = {
  leftAt: string;
  location?: ArrivalLocation;
};

export type VisitSummary = {
  id: VisitId;
  clientId: ClientId;
  clientName: string;
  scheduledFor: string;
  status: VisitStatus;
  systemsCount: number;
};

export type VisitSystem = {
  id: string;
  name: string;
  type: string;
};

export type VisitDetails = VisitSummary & {
  clientAddress?: string;
  systems: VisitSystem[];
  arrival?: {
    arrivedAt: string;
    location?: ArrivalLocation;
  };
  departure?: VisitDeparture;
  durationMinutes?: number;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
  finishedAt?: string;
  syncStatus: SyncStatus;
};

export type StartVisitRequest = {
  operationId: OperationId;
  arrivedAt: string;
  location?: ArrivalLocation;
};

export type StartVisitResponse = VisitDetails;

export type FinishVisitRequest = {
  operationId: OperationId;
  finishedAt: string;
  location?: ArrivalLocation;
  description?: string;
  attendantIds?: string[];
  photos?: VisitPhoto[];
};

export type FinishVisitResponse = VisitDetails;

export type CreateVisitRequest = {
  clientId: ClientId;
  employeeId: UserId;
  scheduledFor: string;
  systems: Array<{ id?: string; name: string; type: string }>;
};

export type CreateVisitResponse = VisitDetails;

export type AuthUser = {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = LoginResponse;
```

- [x] **Step 4: Executar teste para verificar sucesso**

Run: `npm test --workspace=@qqs/contracts`  
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add packages/contracts/src/index.ts packages/contracts/src/index.test.ts
git commit -m "feat(contracts): add departure, attendants, photos, and create visit types"
```

---

### Task 2: Backend — Atualização do Caso de Uso `finishVisit` e Entidade `Visit`

**Files:**
- Modify: `backend/src/modules/visits/domain/visit.ts`
- Modify: `backend/src/modules/visits/application/finish-visit.ts`
- Modify: `backend/src/modules/visits/infrastructure/in-memory-visit-repository.ts`
- Create / Modify: `backend/src/modules/visits/application/finish-visit.test.ts`

**Interfaces:**
- Consumes: `FinishVisitRequest`, `VisitDetails`, `EmployeeSummary`, `VisitPhoto` de `@qqs/contracts`.
- Produces: `finishVisit(repository, input)` atualizado com cálculo de duração e campos complementares.

- [x] **Step 1: Escrever teste unitário para `finishVisit` com os novos campos**

Criar `backend/src/modules/visits/application/finish-visit.test.ts`:
```typescript
import { test } from "node:test";
import assert from "node:assert/strict";

import { finishVisit } from "./finish-visit.js";
import { InMemoryVisitRepository } from "../infrastructure/in-memory-visit-repository.js";
import type { Visit } from "../domain/visit.js";

test("finishVisit records departure location, duration, description, attendants and photos", async () => {
  const repository = new InMemoryVisitRepository();
  const initialVisit: Visit = {
    id: "visit-001",
    clientId: "client-001",
    employeeId: "emp-1",
    status: "in_progress",
    scheduledFor: "2026-09-22T13:00:00.000Z",
    arrivedAt: "2026-09-22T13:00:00.000Z",
    arrivalLocation: { latitude: -3.1, longitude: -60.0 },
    lastStartOperationId: "op-start-1",
  };
  await repository.save(initialVisit);

  const updated = await finishVisit(repository, {
    visitId: "visit-001",
    clientId: "client-001",
    employeeId: "emp-1",
    operationId: "op-finish-1",
    finishedAt: "2026-09-22T14:30:00.000Z",
    location: { latitude: -3.1005, longitude: -60.0005, accuracy: 5 },
    description: "Revisão e limpeza dos sistemas finalizada com sucesso.",
    attendants: [{ id: "emp-2", name: "Marcos", email: "marcos@qqs.com", role: "employee" }],
    photos: [{ id: "p1", uri: "file://photo1.jpg", caption: "Antes", takenAt: "2026-09-22T13:15:00.000Z" }],
  });

  assert.equal(updated.status, "completed");
  assert.equal(updated.finishedAt, "2026-09-22T14:30:00.000Z");
  assert.equal(updated.durationMinutes, 90);
  assert.equal(updated.departureLocation?.latitude, -3.1005);
  assert.equal(updated.description, "Revisão e limpeza dos sistemas finalizada com sucesso.");
  assert.equal(updated.attendants?.length, 1);
  assert.equal(updated.photos?.length, 1);
});
```

- [x] **Step 2: Executar teste para verificar falha**

Run: `npm test --workspace=@qqs/backend`  
Expected: FAIL com propriedades ausentes em `finishVisit` / `Visit`.

- [x] **Step 3: Implementar suporte aos novos campos em `Visit` e `finishVisit`**

Atualizar `backend/src/modules/visits/domain/visit.ts`:
```typescript
import type { ArrivalLocation, ClientId, EmployeeSummary, OperationId, UserId, VisitId, VisitPhoto, VisitStatus } from "@qqs/contracts";

export type Visit = {
  id: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  status: VisitStatus;
  scheduledFor?: string;
  arrivedAt?: string;
  arrivalLocation?: ArrivalLocation;
  leftAt?: string;
  departureLocation?: ArrivalLocation;
  durationMinutes?: number;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
  finishedAt?: string;
  lastStartOperationId?: OperationId;
  lastFinishOperationId?: OperationId;
};
```

Atualizar `backend/src/modules/visits/application/finish-visit.ts`:
```typescript
import type { ArrivalLocation, ClientId, EmployeeSummary, OperationId, UserId, VisitId, VisitPhoto } from "@qqs/contracts";

import type { Visit } from "../domain/visit.js";

export type FinishVisitInput = {
  visitId: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  operationId: OperationId;
  finishedAt: string;
  location?: ArrivalLocation;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
};

export type FinishVisitRepository = {
  findById(id: VisitId): Promise<Visit | undefined>;
  save(visit: Visit): Promise<Visit>;
};

export async function finishVisit(
  repository: FinishVisitRepository,
  input: FinishVisitInput,
): Promise<Visit> {
  const existingVisit = await repository.findById(input.visitId);

  const arrivedTime = existingVisit?.arrivedAt ? new Date(existingVisit.arrivedAt).getTime() : new Date(input.finishedAt).getTime();
  const finishedTime = new Date(input.finishedAt).getTime();
  const durationMinutes = Math.max(0, Math.round((finishedTime - arrivedTime) / (1000 * 60)));

  return repository.save({
    ...existingVisit,
    id: input.visitId,
    clientId: input.clientId,
    employeeId: input.employeeId,
    status: "completed",
    arrivedAt: existingVisit?.arrivedAt ?? input.finishedAt,
    finishedAt: input.finishedAt,
    leftAt: input.finishedAt,
    departureLocation: input.location,
    durationMinutes,
    description: input.description ?? existingVisit?.description,
    attendants: input.attendants ?? existingVisit?.attendants,
    photos: input.photos ?? existingVisit?.photos,
    lastFinishOperationId: input.operationId,
  });
}
```

Atualizar `backend/src/modules/visits/infrastructure/in-memory-visit-repository.ts` para mapear corretamente todas as novas propriedades ao salvar e recuperar visitas.

- [x] **Step 4: Executar testes para verificar sucesso**

Run: `npm test --workspace=@qqs/backend`  
Expected: PASS no novo teste `finish-visit.test.ts`.

- [x] **Step 5: Commit**

```bash
git add backend/src/modules/visits/domain/visit.ts backend/src/modules/visits/application/finish-visit.ts backend/src/modules/visits/application/finish-visit.test.ts backend/src/modules/visits/infrastructure/in-memory-visit-repository.ts
git commit -m "feat(backend): support departure location, duration, description, attendants and photos in finishVisit"
```

---

### Task 3: Backend — Rotas `POST /visits/:id/finish`, `GET /employees` e `POST /visits`

**Files:**
- Modify: `backend/src/modules/visits/presentation/visit-routes.ts`
- Modify: `backend/src/modules/visits/presentation/visit-routes.test.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Produces: `POST /visits/:id/finish`, `GET /employees`, `POST /visits`.

- [x] **Step 1: Adicionar testes de integração das rotas**

Editar `backend/src/modules/visits/presentation/visit-routes.test.ts` adicionando:
1. Teste de `POST /visits/:id/finish` com dados de saída, descrição e fotos.
2. Teste de `GET /employees` retornando a lista de colaboradores para acompanhamento.
3. Teste de `POST /visits` permitindo ao supervisor criar uma nova visita com sucesso.

- [x] **Step 2: Executar testes e confirmar falha das novas rotas**

Run: `npm test --workspace=@qqs/backend`  
Expected: FAIL nas rotas novas.

- [x] **Step 3: Implementar endpoints em `visit-routes.ts` e registrar rota `/employees`**

Implementar o tratamento no `visit-routes.ts` recebendo `location`, `description`, `attendants` e `photos`, mapeando o retorno em formato `VisitDetails`. Implementar a rota `/employees` que retorna os técnicos cadastrados, e a criação de visita em `POST /visits` com validação de perfil `supervisor`.

- [x] **Step 4: Executar testes de integração do backend**

Run: `npm test --workspace=@qqs/backend`  
Expected: PASS com 100% de sucesso.

- [x] **Step 5: Commit**

```bash
git add backend/src/modules/visits/presentation/visit-routes.ts backend/src/modules/visits/presentation/visit-routes.test.ts backend/src/app.ts
git commit -m "feat(backend): add /employees, /visits creation, and enriched /visits/:id/finish endpoints"
```

---

### Task 4: Frontend UI Component — `WeekCalendarStrip`

**Files:**
- Create: `frontend/src/shared/ui/components/WeekCalendarStrip.tsx`
- Create: `frontend/src/shared/ui/components/WeekCalendarStrip.styles.ts`
- Create: `frontend/src/shared/ui/components/WeekCalendarStrip.test.tsx`

**Interfaces:**
- Produces: `WeekCalendarStrip({ selectedDate, onSelectDate, visitCountsByDate })`.

- [x] **Step 1: Escrever teste para `WeekCalendarStrip`**

Criar `frontend/src/shared/ui/components/WeekCalendarStrip.test.tsx`:
```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import { WeekCalendarStrip } from "./WeekCalendarStrip.js";

test("WeekCalendarStrip renders 7 days of the week and highlights the selected day", () => {
  let selected = "2026-09-22";
  const renderer = ReactTestRenderer.create(
    <WeekCalendarStrip
      selectedDate={selected}
      onSelectDate={(d) => { selected = d; }}
      visitCountsByDate={{ "2026-09-22": 3, "2026-09-23": 1 }}
    />,
  );

  const json = JSON.stringify(renderer.toJSON());
  assert.ok(json.includes("22"), "Deve exibir o dia 22");
  assert.ok(json.includes("3"), "Deve exibir o badge com 3 visitas para o dia 22");
});
```

- [x] **Step 2: Executar teste e confirmar falha**

Run: `npm test --workspace=@qqs/frontend`  
Expected: FAIL (`WeekCalendarStrip` inexistente).

- [x] **Step 3: Implementar `WeekCalendarStrip` e seus estilos**

Criar `frontend/src/shared/ui/components/WeekCalendarStrip.styles.ts` e `WeekCalendarStrip.tsx` com navegação semanal (semana anterior/seguinte/hoje), pílulas de dias da semana (*DOM, SEG, TER, QUA, QUI, SEX, SAB*), indicador visual de dia selecionado com azul corporativo (`#0876C9`), e bolinha com contagem de visitas.

- [x] **Step 4: Executar teste e confirmar aprovação**

Run: `npm test --workspace=@qqs/frontend`  
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add frontend/src/shared/ui/components/WeekCalendarStrip.tsx frontend/src/shared/ui/components/WeekCalendarStrip.styles.ts frontend/src/shared/ui/components/WeekCalendarStrip.test.tsx
git commit -m "feat(ui): add interactive WeekCalendarStrip component"
```

---

### Task 5: Frontend UI Components — `StaffPicker`, `ServiceReportCard` e `PhotoEvidencePicker`

**Files:**
- Create: `frontend/src/shared/ui/components/StaffPicker.tsx`
- Create: `frontend/src/shared/ui/components/StaffPicker.styles.ts`
- Create: `frontend/src/shared/ui/components/StaffPicker.test.tsx`
- Create: `frontend/src/shared/ui/components/ServiceReportCard.tsx`
- Create: `frontend/src/shared/ui/components/ServiceReportCard.styles.ts`
- Create: `frontend/src/shared/ui/components/PhotoEvidencePicker.tsx`
- Create: `frontend/src/shared/ui/components/PhotoEvidencePicker.styles.ts`
- Create: `frontend/src/shared/ui/components/PhotoEvidencePicker.test.tsx`

**Interfaces:**
- Produces:
  - `StaffPicker({ employees, selectedIds, onToggle })`
  - `ServiceReportCard({ value, onChangeText, editable })`
  - `PhotoEvidencePicker({ photos, onAddPhoto, onRemovePhoto, onUpdateCaption, editable })`

- [x] **Step 1: Escrever testes unitários para `StaffPicker` e `PhotoEvidencePicker`**

Testar seleção/desmarcar de funcionários e adição/remoção de fotos com legendas.

- [x] **Step 2: Executar testes e verificar falha**

Run: `npm test --workspace=@qqs/frontend`  
Expected: FAIL.

- [x] **Step 3: Implementar os componentes e estilos**

1. `StaffPicker`: Lista de colaboradores com checkboxes táteis e indicador de quantidade selecionada.
2. `ServiceReportCard`: Card com título "Relatório da Visita / Serviços Realizados", textarea espaçoso e contador de caracteres.
3. `PhotoEvidencePicker`: Botões "Tirar Foto" e "Anexar da Galeria", grade de miniaturas com botão de exclusão e input de legenda individual.

- [x] **Step 4: Executar testes e verificar aprovação**

Run: `npm test --workspace=@qqs/frontend`  
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add frontend/src/shared/ui/components/StaffPicker.* frontend/src/shared/ui/components/ServiceReportCard.* frontend/src/shared/ui/components/PhotoEvidencePicker.*
git commit -m "feat(ui): add StaffPicker, ServiceReportCard, and PhotoEvidencePicker components"
```

---

### Task 6: Frontend — Atualização do `LocationMap` com Live Location e Marcação de Saída

**Files:**
- Modify: `frontend/src/shared/ui/components/LocationMap.tsx`
- Modify: `frontend/src/shared/ui/components/LocationMap.styles.ts`

**Interfaces:**
- Consumes: `latitude`, `longitude`, `address`, `clientName`, `onConfirmArrival`, `departureLocation`, `departureTime`.
- Produces: Mapa dinâmico exibindo a posição do técnico, botão "Confirmar Chegada (OK)" antes do check-in e resumo de saída quando concluída.

- [x] **Step 1: Atualizar testes ou props do `LocationMap`**

Verificar que o mapa aceita os estados:
1. Pré-chegada (Live): exibe botão "Confirmar Chegada (OK)".
2. Chegada confirmada: exibe pin de entrada.
3. Saída concluída: exibe coordenadas e horário de saída.

- [x] **Step 2: Implementar as novas propriedades e estados visuais em `LocationMap.tsx`**

Adicionar suporte ao botão de ação "Confirmar Chegada (OK)" diretamente integrado ao card do mapa, e à exibição das coordenadas e horário de saída no rodapé do mapa.

- [x] **Step 3: Executar testes de UI**

Run: `npm test --workspace=@qqs/frontend`  
Expected: PASS.

- [x] **Step 4: Commit**

```bash
git add frontend/src/shared/ui/components/LocationMap.tsx frontend/src/shared/ui/components/LocationMap.styles.ts
git commit -m "feat(ui): enhance LocationMap with live location preview, arrival OK action, and departure stats"
```

---

### Task 7: Frontend — Redesenho Completo de `VisitDetailsScreen`

**Files:**
- Modify: `frontend/src/modules/visits/VisitDetailsScreen.tsx`
- Modify: `frontend/src/modules/visits/VisitDetailsScreen.styles.ts`
- Modify: `frontend/src/modules/visits/VisitDetailsScreen.test.tsx`
- Modify: `frontend/src/modules/visits/visit-api.ts`

**Interfaces:**
- Integra todos os componentes na jornada do técnico:
  1. Header do cliente + status badge
  2. Mapa ao vivo com botão "Confirmar Chegada (OK)"
  3. Cronômetro ao vivo em andamento
  4. Card de equipe presente (`StaffPicker`)
  5. Card de relatório de serviço (`ServiceReportCard`)
  6. Card de evidências fotográficas (`PhotoEvidencePicker`)
  7. Botão destacado "Marcar Saída" capturando GPS final e salvando localmente.

- [x] **Step 1: Escrever teste de integração de `VisitDetailsScreen`**

Atualizar `frontend/src/modules/visits/VisitDetailsScreen.test.tsx` para cobrir o fluxo completo:
- Chegada com GPS
- Inclusão de fotos e descrição
- Seleção de equipe
- Finalização de visita ("Marcar Saída")

- [x] **Step 2: Executar teste e verificar falha**

Run: `npm test --workspace=@qqs/frontend`  
Expected: FAIL.

- [x] **Step 3: Implementar a tela completa com UX refinada e estados reativos**

Atualizar `VisitDetailsScreen.tsx` e `VisitDetailsScreen.styles.ts` integrando `LocationMap`, `VisitTimer`, `StaffPicker`, `ServiceReportCard`, `PhotoEvidencePicker`, além da captura da localização de saída no `handleFinish`.

- [x] **Step 4: Executar testes do frontend**

Run: `npm test --workspace=@qqs/frontend`  
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add frontend/src/modules/visits/VisitDetailsScreen.tsx frontend/src/modules/visits/VisitDetailsScreen.styles.ts frontend/src/modules/visits/VisitDetailsScreen.test.tsx frontend/src/modules/visits/visit-api.ts
git commit -m "feat(visits): redesign VisitDetailsScreen with modern UX, live arrival OK, staff picker, photo evidence, and checkout"
```

---

### Task 8: Frontend — Agenda Semanal em `VisitsScreen`, `AdminHomeScreen` e Modal de Agendamento

**Files:**
- Modify: `frontend/src/modules/visits/VisitsScreen.tsx`
- Modify: `frontend/src/modules/visits/VisitsScreen.styles.ts`
- Modify: `frontend/src/modules/admin/AdminHomeScreen.tsx`
- Create: `frontend/src/modules/admin/AdminScheduleModal.tsx`
- Create: `frontend/src/modules/admin/AdminScheduleModal.styles.ts`

**Interfaces:**
- Produces: Visão com calendário semanal para o técnico e para o administrador, com filtro por dia e modal para o gestor agendar nova visita.

- [x] **Step 1: Integrar `WeekCalendarStrip` na `VisitsScreen` e filtrar visitas por data**

Permitir que o técnico veja as visitas do dia selecionado, com navegação suave e contadores automáticos no calendário.

- [x] **Step 2: Integrar `WeekCalendarStrip` e botão "+ Agendar Visita" na `AdminHomeScreen`**

Adicionar `AdminScheduleModal` permitindo ao supervisor selecionar o cliente, técnico responsável, data/hora e sistemas a inspecionar.

- [x] **Step 3: Executar testes de renderização das telas**

Run: `npm test --workspace=@qqs/frontend`  
Expected: PASS.

- [x] **Step 4: Commit**

```bash
git add frontend/src/modules/visits/VisitsScreen.* frontend/src/modules/admin/AdminHomeScreen.* frontend/src/modules/admin/AdminScheduleModal.*
git commit -m "feat(admin): add calendar strip to visits screens and implement AdminScheduleModal"
```

---

### Task 9: Verificação Global Ponta a Ponta e Tipagem

**Files:**
- Monorepo completo (`packages/contracts`, `backend`, `frontend`)

- [x] **Step 1: Executar verificação estrita de tipos em todo o monorepo**

Run: `npm run typecheck`  
Expected: 0 erros encontrados.

- [x] **Step 2: Executar todas as suítes de testes automatizados**

Run: `npm test --workspace=@qqs/contracts && npm test --workspace=@qqs/backend && npm test --workspace=@qqs/frontend`  
Expected: Todos os testes passando 100%.

- [x] **Step 3: Revisão final de Clean Code e commit de consolidação**

Verificar formatação, ausência de dead code e conformidade total com os requisitos.
