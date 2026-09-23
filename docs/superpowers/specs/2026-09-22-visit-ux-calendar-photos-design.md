# Especificação de Design — Evolução de UI/UX, Calendário, Check-in/Check-out e Evidências

**Status:** Pronto para revisão do solicitante  
**Data:** 22/09/2026  
**Documento de Origem:** RS-001 v0.2 / Brainstorming com o solicitante  

---

## 1. Objetivo

Aprimorar a experiência visual (UI/UX) e as funcionalidades operacionais do QQS App para técnicos de campo e administradores, transformando a interface em uma ferramenta profissional, responsiva e moderna.

O fluxo cobre:
- Calendário semanal interativo compartilhado entre técnico e administrador com filtro por data;
- Mapa do Google Maps ao vivo com localização do técnico antes e durante o check-in;
- Botão "Confirmar Chegada (OK)" para início de atendimento com GPS;
- Cronômetro de visita ativo em tempo real;
- Seleção simples e ágil dos funcionários/acompanhantes presentes;
- Campo dedicado para relatório e descrição dos serviços executados;
- Anexação de fotos/evidências (câmera e galeria) com legendas e miniaturas;
- Botão "Marcar Saída" com captura de localização de encerramento, cálculo de duração total e suporte offline resiliente;
- Painel administrativo com agendamento de novas visitas e auditoria completa do atendimento.

---

## 2. Escopo

### 2.1 Incluído no Incremento

1. **Contratos Compartilhados (`@qqs/contracts`):**
   - Atualização de `VisitDetails` e `FinishVisitRequest` com `description`, `attendants`, `photos`, `departure` (horário e geolocalização) e `durationMinutes`.
   - Adição do modelo `Employee` (`id`, `name`, `role`, `email`) e tipos para listagem e agendamento.
   - Atualização do modelo `CreateVisitRequest` para agendamento de visitas pelo administrador.

2. **Frontend Mobile/Web (React Native / Expo):**
   - **`WeekCalendarStrip`**: Barra horizontal de calendário no topo (dias da semana, badges de contagem de visitas, alternância de data e navegação semanal).
   - **`LiveLocationMap`**: Componente de mapa Google Maps atualizado para mostrar a localização em tempo real do técnico, com botão "Confirmar Chegada (OK)" e modos rua/satélite.
   - **`StaffPicker`**: Card de equipe para seleção rápida de acompanhantes via checkboxes modernos.
   - **`ServiceReportCard`**: Card de descrição de serviço executado com validação e contador de caracteres.
   - **`PhotoEvidencePicker`**: Card para captura/anexação de fotos com galeria de miniaturas, exclusão e legendas.
   - **`VisitDetailsScreen`**: Redesenho completo com UX fluida, cards modulares, feedback háptico/visual e botão fixo "Marcar Saída".
   - **`AdminHomeScreen` e `AdminScheduleModal`**: Painel do administrador integrado ao calendário semanal com modal para agendamento de novas visitas e auditoria com mapa e fotos.

3. **Backend (`@qqs/backend`):**
   - Atualização do caso de uso `finishVisit` e da rota `POST /visits/:id/finish` para persistir descrição, fotos, acompanhantes e saída.
   - Implementação de `GET /employees` para listar funcionários disponíveis.
   - Implementação de `POST /visits` para criação/agendamento de visitas pelo administrador.
   - Suporte idempotente com `operationId` para manter funcionamento offline.

4. **Testes e Qualidade (TDD / Clean Code):**
   - Testes unitários de contratos, componentes visuais e casos de uso de backend.
   - Testes de integração das rotas de visitas e funcionários.
   - Zero regressão nos testes existentes.

### 2.2 Fora deste Incremento

- Assinatura digital do cliente na tela do celular (prevista para incremento posterior).
- Geração e exportação do arquivo PDF preenchido da visita.
- Modelos dinâmicos de checklist por tipo de equipamento (conforme RF-021).

---

## 3. Modelo de Dados e Contratos (`@qqs/contracts`)

### 3.1 Novos Tipos e Extensões

```typescript
export type EmployeeSummary = {
  id: string;
  name: string;
  email: string;
  role: "employee" | "supervisor";
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

export type FinishVisitRequest = {
  operationId: OperationId;
  finishedAt: string;
  location?: ArrivalLocation;
  description?: string;
  attendantIds?: string[];
  photos?: Array<{ id: string; uri: string; caption?: string; takenAt: string }>;
};

export type CreateVisitRequest = {
  clientId: ClientId;
  employeeId: UserId;
  scheduledFor: string;
  systems: Array<{ id?: string; name: string; type: string }>;
};
```

---

## 4. Arquitetura e Componentes Frontend

### 4.1 Hierarquia de Componentes

```
frontend/src/
├── shared/ui/
│   ├── components/
│   │   ├── WeekCalendarStrip.tsx       <-- Seletor semanal horizontal
│   │   ├── LocationMap.tsx             <-- Google Maps atualizado (live + chegada/saída)
│   │   ├── StaffPicker.tsx             <-- Seleção de equipe acompanhante
│   │   ├── PhotoEvidencePicker.tsx     <-- Upload e listagem de fotos com legenda
│   │   └── ServiceReportCard.tsx       <-- Descrição do serviço
├── modules/
│   ├── visits/
│   │   ├── VisitDetailsScreen.tsx      <-- Tela completa redesenhada
│   │   ├── VisitTimer.tsx              <-- Cronômetro em tempo real
│   │   ├── VisitCard.tsx               <-- Card da visita na agenda
│   │   └── visit-store.ts              <-- Persistência local da visita
│   └── admin/
│       ├── AdminHomeScreen.tsx         <-- Dashboard com agenda geral
│       └── AdminScheduleModal.tsx      <-- Modal para marcar nova visita
```

### 4.2 Detalhes dos Componentes de UI/UX

1. **`WeekCalendarStrip`**:
   - Apresenta os 7 dias da semana selecionada (ex: D, S, T, Q, Q, S, S).
   - O dia de hoje tem destaque sutil na cor da marca (`#0876C9`).
   - O dia selecionado é realçado com fundo azul corporativo e texto branco.
   - Pílulas com contador numérico de visitas em cada dia.
   - Navegação facilitada com botões de semana anterior/próxima e botão "Hoje".

2. **`LocationMap`**:
   - Integração segura com Google Maps via iframe responsivo (web) e fallback com link direto e detalhes GPS (mobile).
   - Exibe dois estados:
     - *Pré-chegada:* Exibe a posição do técnico ao vivo e botão proeminente "Confirmar Chegada (OK)".
     - *Pós-chegada:* Exibe o pin da chegada e, quando houver saída, o pin e detalhes da saída.

3. **`StaffPicker`**:
   - Lista os colaboradores disponíveis.
   - Checkbox tátil grande para seleção ágil sem exigir digitação de texto.
   - Badge com a contagem total de participantes da visita.

4. **`PhotoEvidencePicker`**:
   - Suporte a seleção de imagem via `expo-image-picker` / input web com fallback.
   - Grade com miniaturas de fotos arredondadas e botão de lixeira no canto superior direito.
   - Campo compacto de legenda abaixo de cada miniatura.

5. **`ServiceReportCard`**:
   - Textarea com visual limpo, borda sutil ao focar e placeholder claro: *"Descreva em detalhes o serviço executado, testes realizados e condições encontradas..."*.

6. **`AdminScheduleModal`**:
   - Formulário limpo para o gestor escolher o Cliente, Técnico responsável, Data/Hora e Sistemas a serem atendidos.

---

## 5. Arquitetura e Fluxo do Backend

### 5.1 Endpoints

- `GET /visits`: Lista visitas filtradas por perfil (técnico: atribuídas a ele; supervisor: todas as visitas).
- `GET /visits/:id`: Retorna detalhes completos da visita incluindo localização de chegada e saída, fotos, acompanhantes e descrição.
- `POST /visits/:id/start`: Registra chegada e coordenadas de início (idempotente).
- `POST /visits/:id/finish`: Registra a saída com localização, horário, cálculo de duração, persistência da descrição, equipe e fotos.
- `POST /visits`: Criação de uma nova visita com sistemas (restrito ao supervisor).
- `GET /employees`: Lista todos os funcionários ativos para preenchimento de equipe e agendamento.

---

## 6. Resiliência Offline e Sincronização

1. O técnico pode abrir a visita, marcar chegada, tirar fotos e registrar saída completamente desconectado.
2. Todas as informações são persistidas no `VisitStore` do dispositivo.
3. A `SyncQueue` enfileira a operação `visit.finish` com `operationId` único.
4. Ao restabelecer a conexão, a sincronização é executada automaticamente sem duplicação de dados.

---

## 7. Estratégia de Testes

1. **Testes de Contratos:**
   - Validação da estrutura de `VisitDetails`, `FinishVisitRequest` e `EmployeeSummary`.
2. **Testes do Backend:**
   - `finishVisit`: Salva descrição, fotos, acompanhantes e saída calculando a duração.
   - `POST /visits/:id/finish`: Validação de requisição e persistência idempotente.
   - `POST /visits`: Permissão exclusiva de supervisor e validação dos campos de agendamento.
3. **Testes do Frontend:**
   - `WeekCalendarStrip.test.tsx`: Renderização dos dias, troca de dia selecionado e contadores.
   - `StaffPicker.test.tsx`: Seleção e desmarcar acompanhantes.
   - `PhotoEvidencePicker.test.tsx`: Adição e remoção de fotos com legenda.
   - `VisitDetailsScreen.test.tsx`: Ciclo completo de chegada ("OK"), preenchimento de campos e saída.

---

## 8. Verificação e Auto-Revisão da Especificação

- [x] Sem placeholders, TBD ou TODOs.
- [x] Consistência integral entre contratos, frontend e backend.
- [x] Alinhamento estrito aos requisitos do solicitante (calendário para ambos, admin agendando e visualizando, mapa de localização, OK de chegada, marcação de saída, descrição, equipe e fotos).
- [x] Diretrizes de Clean Code, tipagem TypeScript estrita e padrões React Native / Expo mantidos.
