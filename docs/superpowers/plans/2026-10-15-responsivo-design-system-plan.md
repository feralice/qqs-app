# Layout responsivo e padronização visual do app Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer todas as telas do app funcionarem em qualquer largura de celular em retrato (320 px a 412+ px), centralizar no web (maxWidth 560 px), padronizar os estilos com um design system unificado em `theme.ts` e reformular o visual do Resumo do dia com a seção Equipe em campo.

**Architecture:** Estabelecer tokens de cor semântica, espaçamento, raio e tipografia em `theme.ts`. Criar primitivas de layout responsivo (`layoutFor`, `useLayout`, `LayoutProvider`, `Screen`, `Grid`) para desacoplar a lógica de tela dos componentes. Migrar sistematicamente componentes compartilhados, telas de autenticação, área do técnico e área do supervisor para os tokens, eliminando estilos inline e garantindo áreas de toque mínimas e resiliência de texto (`flexShrink`, `numberOfLines`, `flexWrap`). Criar teste estático que impede valores visuais literais nos arquivos `.styles.ts`.

**Tech Stack:** React Native, Expo, TypeScript, React Context, Node.js test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-10-15-responsivo-design-system-design.md`

## Global Constraints

- Retrato mobile como alvo principal (320 px a 412+ px); web apenas centralizado com `maxWidth: 560`.
- As 6 cores de marca (`corporateBlue`, `lightBlue`, `aqua`, `white`, `nearBlack`, `darkGray`) permanecem inalteradas com mesmos nomes e valores.
- Tokens semânticos: `background: #F4F8FC`, `text: #242424`, `textMuted: #64748B`, `textSubtle: #94A3B8`, `surface: #FFFFFF`, `surfaceAlt: #F8FAFC`, `surfaceTint: #F0F7FD`, `border: #E2E8F0`, `borderStrong: #CBD5E1`, `success: #27AE60`, `successBg: #EAFAF1`, `warning: #F39C12`, `warningBg: #FEF5E7`, `danger: #C0392B`, `dangerBg: #FDEDEC`.
- Escala de espaçamento: `xxs: 2`, `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`. Renomeação da escala anterior: usos existentes de `spacing.md (16)` viram `spacing.lg (16)`, e `spacing.lg (24)` viram `spacing.xl (24)`.
- Escala de raio: `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `pill: 999`.
- Escala tipográfica: `xs: 11`, `sm: 12`, `md: 14`, `lg: 16`, `xl: 20`, `display: 26`. Pesos: `regular: "400"`, `semibold: "600"`, `bold: "700"`.
- `layoutFor(width)`: `< 360 px` => `{ width, size: "compact", gutter: 12 }`; `>= 360 px` => `{ width, size: "regular", gutter: 16 }`.
- Todo elemento clicável com área de toque mínima de 44 px de altura.
- Textos variáveis em linha com `flexShrink: 1` e `numberOfLines`. Linhas com múltiplos selos ou botões com `flexWrap: "wrap"`.
- Números de destaque (`StatCard`) com `maxFontSizeMultiplier={1.3}`.
- Remoção da seção "Métricas da Operação" com valores fixos.
- Todo arquivo `.styles.ts` deve utilizar apenas tokens do `theme.ts` (sem cores hexadecimais, `fontSize` ou `borderRadius` literais).

## Review Focus

1. **Largura estreita (320 px) com nomes longos:** textos de clientes, técnicos ou endereços não quebram ícones ou bordas (testado em `VisitCard.test.tsx` e `AdminDashboardSummary.test.tsx`).
2. **Resumo do dia sem visitas:** exibe bloco vazio dedicado com texto "Nenhuma visita para este dia" e ícone, sem renderizar StatCards com zero (testado em `AdminDashboardSummary.test.tsx`).
3. **Resumo com dados desatualizados (`isStale: true`):** horário é acompanhado de selo warning com ícone `cloud-offline` (testado em `AdminDashboardSummary.test.tsx`).
4. **Ordenação da Equipe em Campo:** lista ordenada estritamente por `busy` (Em visita), `available` (Disponível) e `offline` (Offline), com reticências em nomes longos (testado em `AdminDashboardSummary.test.tsx`).
5. **Expansão de equipe com mais de 5 técnicos:** botão "Ver todos (N)" expande inline sem recarregar tela nem quebrar layout (testado em `AdminDashboardSummary.test.tsx`).

---

### Task 1: Tokens e fundação do Design System em `theme.ts`

**Files:**
- Modify: `frontend/src/shared/ui/theme.ts`
- Test: `frontend/src/shared/ui/theme.test.ts`

**Interfaces:**
- Consumes: Definição existente de `colors`.
- Produces: `theme.colors` (marca + semânticas), `theme.spacing` (`xxs` a `xxl`), `theme.radius` (`sm` a `pill`), `theme.typography` (`sizes` e `weights`).

- [ ] **Step 1: Escrever testes para os novos tokens semânticos e escalas em `frontend/src/shared/ui/theme.test.ts`**

```typescript
test("theme exposes the complete semantic palette and scales", () => {
  assert.equal(theme.colors.background, "#F4F8FC");
  assert.equal(theme.colors.text, "#242424");
  assert.equal(theme.colors.textMuted, "#64748B");
  assert.equal(theme.colors.textSubtle, "#94A3B8");
  assert.equal(theme.colors.surface, "#FFFFFF");
  assert.equal(theme.colors.surfaceAlt, "#F8FAFC");
  assert.equal(theme.colors.surfaceTint, "#F0F7FD");
  assert.equal(theme.colors.border, "#E2E8F0");
  assert.equal(theme.colors.borderStrong, "#CBD5E1");
  assert.equal(theme.colors.success, "#27AE60");
  assert.equal(theme.colors.successBg, "#EAFAF1");
  assert.equal(theme.colors.warning, "#F39C12");
  assert.equal(theme.colors.warningBg, "#FEF5E7");
  assert.equal(theme.colors.danger, "#C0392B");
  assert.equal(theme.colors.dangerBg, "#FDEDEC");

  assert.deepEqual(theme.spacing, {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  });

  assert.deepEqual(theme.radius, {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  });

  assert.deepEqual(theme.typography.sizes, {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    display: 26,
  });
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx frontend/src/shared/ui/theme.test.ts`  
Expected: FAIL com propriedades inexistentes em `theme`.

- [ ] **Step 3: Implementar novos tokens em `frontend/src/shared/ui/theme.ts`**

Adicionar as cores semânticas preservando `colors` original, nova escala de espaçamento com renomeação (`md: 12, lg: 16, xl: 24`), raios e tipografia.

- [ ] **Step 4: Rodar teste para verificar aprovação**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx frontend/src/shared/ui/theme.test.ts`  
Expected: PASS.

- [ ] **Step 5: Validar typecheck**

Run: `npm run typecheck --workspace=@qqs/frontend`  
Expected: PASS (ou identificação de usos imediatos de `theme.spacing` que precisem de ajuste de tipo).

---

### Task 2: Primitivas de Layout Responsivo (`layoutFor`, `useLayout`, `LayoutProvider`, `Screen`, `Grid`)

**Files:**
- Create: `frontend/src/shared/ui/layout/layout.ts`
- Create: `frontend/src/shared/ui/layout/LayoutProvider.tsx`
- Create: `frontend/src/shared/ui/layout/Screen.tsx`
- Create: `frontend/src/shared/ui/layout/Screen.styles.ts`
- Create: `frontend/src/shared/ui/layout/Grid.tsx`
- Create: `frontend/src/shared/ui/layout/Grid.styles.ts`
- Create: `frontend/src/shared/ui/layout/index.ts`
- Test: `frontend/src/shared/ui/layout/layout.test.ts`
- Test: `frontend/src/shared/ui/layout/Layout.test.tsx`

**Interfaces:**
- Produces:
  - `layoutFor(width: number): { width: number; size: "compact" | "regular"; gutter: number }`
  - `useLayout(): { width: number; size: "compact" | "regular"; gutter: number }`
  - `LayoutProvider({ width, children }: { width?: number; children: ReactNode }): JSX.Element`
  - `Screen({ children, scroll, keyboard, style }: { children?: ReactNode; scroll?: boolean; keyboard?: boolean; style?: StyleProp<ViewStyle> }): JSX.Element`
  - `Grid({ columns, gap, children, style }: { columns?: number; gap?: number; children: ReactNode; style?: StyleProp<ViewStyle> }): JSX.Element`

- [ ] **Step 1: Escrever testes para `layoutFor` em `layout.test.ts` cobrindo 320, 359, 360 e 412 px**

```typescript
test("layoutFor handles screen width boundaries", () => {
  assert.deepEqual(layoutFor(320), { width: 320, size: "compact", gutter: 12 });
  assert.deepEqual(layoutFor(359), { width: 359, size: "compact", gutter: 12 });
  assert.deepEqual(layoutFor(360), { width: 360, size: "regular", gutter: 16 });
  assert.deepEqual(layoutFor(412), { width: 412, size: "regular", gutter: 16 });
});
```

- [ ] **Step 2: Escrever testes para `LayoutProvider`, `Screen` e `Grid` em `Layout.test.tsx`**

Testar renderização de `Screen` com `maxWidth: 560`, centralizado e `paddingHorizontal: gutter`. Testar `Grid` com 1 coluna em compact e 2 colunas em regular.

- [ ] **Step 3: Rodar testes para verificar falha**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/shared/ui/layout/**/*.test.*'`  
Expected: FAIL com módulos não encontrados.

- [ ] **Step 4: Implementar `layout.ts`, `LayoutProvider.tsx`, `Screen.tsx` e `Grid.tsx`**

- `layoutFor`: lógica pura baseada em `width < 360`.
- `LayoutProvider` e `useLayout`: React Context com fallback para `useWindowDimensions()`.
- `Screen`: container com `maxWidth: 560`, `alignSelf: "center"`, `paddingHorizontal: gutter`, suporte a `scroll` (`ScrollView`) e `keyboard` (`KeyboardAvoidingView`).
- `Grid`: distribuição flexível em colunas de mesma largura (`flexBasis` calculado ou flex-wrap com largura percentual) conforme `size`.

- [ ] **Step 5: Rodar testes e verificar aprovação**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/shared/ui/layout/**/*.test.*'`  
Expected: PASS.

- [ ] **Step 6: Validar typecheck**

Run: `npm run typecheck --workspace=@qqs/frontend`  
Expected: PASS.

---

### Task 3: Migração dos Componentes Compartilhados (`shared/ui/components`)

**Files:**
- Modify: `frontend/src/shared/ui/components/Badge.tsx`, `Badge.styles.ts`
- Modify: `frontend/src/shared/ui/components/Button.tsx`, `Button.styles.ts`
- Modify: `frontend/src/shared/ui/components/TextField.tsx`, `TextField.styles.ts`
- Modify: `frontend/src/shared/ui/components/StatCard.tsx`, `StatCard.styles.ts`
- Modify: `frontend/src/shared/ui/components/WeekCalendarStrip.tsx`, `WeekCalendarStrip.styles.ts`
- Modify: `frontend/src/shared/ui/components/StaffPicker.tsx`, `StaffPicker.styles.ts`
- Modify: `frontend/src/shared/ui/components/PhotoEvidencePicker.tsx`, `PhotoEvidencePicker.styles.ts`
- Modify: `frontend/src/shared/ui/components/LocationMap.tsx`, `LocationMap.styles.ts`
- Modify: `frontend/src/shared/ui/components/ServiceReportCard.tsx`, `ServiceReportCard.styles.ts`
- Create/Test: `frontend/src/shared/ui/components/StatCard.test.tsx`
- Create/Test: `frontend/src/shared/ui/components/Badge.test.tsx`
- Create/Test: `frontend/src/shared/ui/components/Button.test.tsx`

**Interfaces:**
- Consumes: `theme.colors`, `theme.spacing`, `theme.radius`, `theme.typography`.
- Produces: Componentes compartilhados padronizados, sem cores hex literais, `StatCard` sem `minWidth: 150` e com `maxFontSizeMultiplier={1.3}`, `Button` com altura mínima de 44 px.

- [ ] **Step 1: Escrever testes para `StatCard` e `Button` verificando acessibilidade e responsividade**

```typescript
test("StatCard renders title, value with font multiplier limit and no fixed minWidth", () => {
  const tree = create(React.createElement(StatCard, { title: "Agendadas", value: "5", iconName: "calendar" }));
  const json = tree.toJSON();
  // Verificar ausência de minWidth: 150 e presença de maxFontSizeMultiplier={1.3}
});

test("Button enforces minimum 44px touch area height", () => {
  const tree = create(React.createElement(Button, { title: "Confirmar", onPress: () => {} }));
  // Verificar style com minHeight >= 44
});
```

- [ ] **Step 2: Rodar testes para verificar falha nos novos requisitos**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/shared/ui/components/**/*.test.*'`  
Expected: FAIL no teste de StatCard/Button.

- [ ] **Step 3: Migrar estilos e JSX de cada componente compartilhado**

- `Badge.styles.ts`: usar `theme.colors.success`, `theme.colors.dangerBg`, etc., e `theme.radius.pill`.
- `Button.styles.ts` & `Button.tsx`: garantir `minHeight: 44`, padding e bordas com tokens.
- `TextField.styles.ts`: `minHeight: 44` no input, borda `theme.colors.border`, foco com `corporateBlue`.
- `StatCard.styles.ts` & `StatCard.tsx`: remover `minWidth: 150`, aplicar tokens, adicionar `maxFontSizeMultiplier={1.3}` no texto do valor.
- `WeekCalendarStrip.styles.ts`: substituir cores e raios soltos por tokens.
- `StaffPicker.styles.ts`: linhas com altura mínima de 44 px, tokens de status.
- `PhotoEvidencePicker.styles.ts`: tokens de borda e raio.
- `LocationMap.styles.ts`: tokens de layout e status.
- `ServiceReportCard.styles.ts`: tokens de superfície e espaçamento.

- [ ] **Step 4: Rodar todos os testes de componentes compartilhados**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/shared/ui/components/**/*.test.*'`  
Expected: PASS em todos os 6+ testes de componentes.

- [ ] **Step 5: Validar typecheck**

Run: `npm run typecheck --workspace=@qqs/frontend`  
Expected: PASS.

---

### Task 4: Migração do `AppShell`, Login e Cadastro

**Files:**
- Modify: `frontend/src/shared/ui/AppShell.tsx`
- Modify: `frontend/src/shared/ui/AppShell.styles.ts`
- Modify: `frontend/src/modules/auth/LoginScreen.tsx`
- Modify: `frontend/src/modules/auth/LoginScreen.styles.ts`
- Modify: `frontend/src/modules/auth/RegisterScreen.tsx`
- Create: `frontend/src/modules/auth/RegisterScreen.styles.ts`
- Create: `frontend/src/modules/auth/AuthScreens.test.tsx`

**Interfaces:**
- Consumes: `Screen` de `shared/ui/layout`, `theme`.
- Produces: `AppShell` usando `Screen` internamente para centralização no web (`maxWidth: 560`); `LoginScreen` e `RegisterScreen` usando `Screen` com suporte a teclado e rolagem (`keyboard`, `scroll`), sem estilos inline no JSX.

- [ ] **Step 1: Escrever testes para `AppShell` e telas de autenticação com `Screen`**

```typescript
test("AppShell wraps content inside responsive Screen component", () => {
  const tree = create(React.createElement(AppShell, null, React.createElement(Text, null, "Conteúdo")));
  // Verificar renderização com Screen limitando maxWidth
});

test("RegisterScreen renders form fields with extracted styles and Screen container", () => {
  // Verificar campos de cadastro, botão com área de toque mínima e ausência de estilos inline
});
```

- [ ] **Step 2: Rodar testes para verificar falha**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx frontend/src/modules/auth/AuthScreens.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Migrar `AppShell` e telas de autenticação**

- `AppShell.tsx`: o header ocupa toda a largura (`background: corporateBlue`); o conteúdo é encapsulado em `<Screen>` com padding lateral baseado no `gutter`. Estilos migrados para tokens.
- `LoginScreen.tsx` & `LoginScreen.styles.ts`: migrar para `<Screen scroll keyboard>`, trocar cores e raios soltos por tokens.
- `RegisterScreen.tsx`: extrair estilos inline para `RegisterScreen.styles.ts`, usar `<Screen scroll keyboard>` e tokens de `theme`.

- [ ] **Step 4: Rodar testes de autenticação e AppShell**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/modules/auth/**/*.test.*'`  
Expected: PASS.

- [ ] **Step 5: Validar typecheck**

Run: `npm run typecheck --workspace=@qqs/frontend`  
Expected: PASS.

---

### Task 5: Migração da Área do Técnico (Módulo de Visitas)

**Files:**
- Modify: `frontend/src/modules/visits/VisitsScreen.tsx`, `VisitsScreen.styles.ts`
- Modify: `frontend/src/modules/visits/VisitCard.tsx`, `VisitCard.styles.ts`
- Modify: `frontend/src/modules/visits/VisitDetailsScreen.tsx`, `VisitDetailsScreen.styles.ts`
- Modify: `frontend/src/modules/visits/VisitTimer.tsx`, `VisitTimer.styles.ts`
- Modify: `frontend/src/modules/visits/ArrivalJustification.tsx`
- Create: `frontend/src/modules/visits/ArrivalJustification.styles.ts`
- Modify: `frontend/src/modules/visits/TechnicianCreateVisitModal.tsx`, `TechnicianCreateVisitModal.styles.ts`
- Modify: `frontend/src/modules/visits/VisitsScreen.test.tsx`
- Modify: `frontend/src/modules/visits/VisitDetailsScreen.test.tsx`

**Interfaces:**
- Consumes: `theme`, `Screen`, `Badge`, `Button`, `StatCard`.
- Produces: Telas e modais do técnico com design system padronizado, textos longos protegidos por `flexShrink: 1` e `numberOfLines={1}`, linhas de ações com `flexWrap: "wrap"`, botões de chegada/checkout com altura mínima 44 px.

- [ ] **Step 1: Escrever testes para resiliência de texto longo em `VisitCard` e `VisitsScreen`**

```typescript
test("VisitCard truncates long company names and addresses without pushing status badge", () => {
  const tree = create(React.createElement(VisitCard, {
    visit: { ...testVisit, clientName: "Empresa com Nome Extremamente Longo que Ocupa Toda a Linha do Celular" },
    onPress: () => {},
  }));
  // Verificar numberOfLines e flexShrink no título
});
```

- [ ] **Step 2: Rodar testes para verificar falhas ou validações**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/modules/visits/**/*.test.*'`

- [ ] **Step 3: Migrar componentes e estilos do módulo de visitas**

- `VisitCard.styles.ts`: tokens de borda, sombra e tipografia; `flexShrink: 1` no título e endereço.
- `VisitsScreen.styles.ts` & `VisitsScreen.tsx`: substituir cabeçalhos e listas por tokens de espaçamento e tipografia; barra de sincronização com cores de aviso semânticas.
- `VisitDetailsScreen.styles.ts` & `VisitDetailsScreen.tsx`: mapa responsivo, timer, cartões de relatório e botão de chegada/saída com área de toque de 44 px.
- `ArrivalJustification.tsx`: extrair estilos inline para `ArrivalJustification.styles.ts` com tokens.
- `TechnicianCreateVisitModal.styles.ts`: formulário de agendamento rápido com espaçamentos da escala.

- [ ] **Step 4: Executar suíte de testes de visitas**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/modules/visits/**/*.test.*'`  
Expected: PASS em todos os testes de visitas existentes e novos.

- [ ] **Step 5: Validar typecheck**

Run: `npm run typecheck --workspace=@qqs/frontend`  
Expected: PASS.

---

### Task 6: Novo Resumo do Dia (`AdminDashboardSummary`) e Área do Supervisor

**Files:**
- Modify: `frontend/src/modules/admin/AdminDashboardSummary.tsx`
- Create: `frontend/src/modules/admin/AdminDashboardSummary.styles.ts`
- Modify: `frontend/src/modules/admin/AdminDashboardSummary.test.tsx`
- Modify: `frontend/src/modules/admin/AdminHomeScreen.tsx`, `AdminHomeScreen.styles.ts`
- Modify: `frontend/src/modules/admin/AdminHomeScreen.test.tsx`
- Modify: `frontend/src/modules/admin/AdminScheduleModal.tsx`, `AdminScheduleModal.styles.ts`
- Modify: `frontend/src/modules/clients/ClientsScreen.tsx`
- Create: `frontend/src/modules/clients/ClientsScreen.styles.ts`
- Modify: `frontend/src/modules/clients/ClientForm.tsx`
- Create: `frontend/src/modules/clients/ClientForm.styles.ts`
- Modify: `frontend/src/modules/clients/ClientPicker.tsx`
- Create: `frontend/src/modules/clients/ClientPicker.styles.ts`
- Modify: `frontend/src/modules/admin/AdminHistoryScreen.tsx`
- Create: `frontend/src/modules/admin/AdminHistoryScreen.styles.ts`

**Interfaces:**
- Consumes: `AdminDashboardSummary` de `@qqs/contracts`, `Grid`, `StatCard`, `Badge`, `theme`.
- Produces:
  - Novo Resumo do dia: Cabeçalho com data e horário ("Atualizado às HH:MM" ou selo `cloud-offline`), 4 `StatCard` em `Grid` (`Agendadas`, `Em andamento`, `Concluídas`, `Atrasadas`), estado vazio sem visitas, alertas críticos com ícones por tipo (`time`, `warning`, `location`), seção "Equipe em campo · N técnicos" ordenada (`busy` -> `available` -> `offline`) com expansão "Ver todos (N)".
  - `AdminHomeScreen` com remoção da seção "Métricas da Operação".
  - Telas de clientes e agendamento com estilos extraídos para `.styles.ts` usando tokens.

- [ ] **Step 1: Escrever testes completos para o novo `AdminDashboardSummary` em `AdminDashboardSummary.test.tsx`**

Testar:
- Resumo com 4 cartões em Grid com ícones e cores especificadas; cor de "Atrasadas" vermelha quando > 0 e textSubtle quando 0.
- `isStale: true`: selo warning com ícone `cloud-offline` e mensagem de offline.
- Sem visitas: bloco vazio com "Nenhuma visita para este dia".
- Alertas críticos: linhas clicáveis com fundo `dangerBg`, ícones por tipo (`time` para `overdue`, `warning` para `problem`, `location` para `outside_radius`) e accessibilityRole="button".
- Equipe em campo: contagem de técnicos no título, ordenação correta (`busy` em azul, `available` em verde, `offline` em cinza), exibição inicial de até 5 técnicos e botão "Ver todos (N)" expandindo os restantes.

- [ ] **Step 2: Rodar testes para verificar falha das novas funcionalidades**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx frontend/src/modules/admin/AdminDashboardSummary.test.tsx`  
Expected: FAIL nos novos comportamentos visuais e de equipe.

- [ ] **Step 3: Implementar `AdminDashboardSummary.styles.ts` e `AdminDashboardSummary.tsx`**

Implementar estrutura completa descrita na spec:
- Cabeçalho com data e horário formatado;
- `Grid` com os 4 `StatCard`;
- Alertas críticos estilizados;
- Equipe em campo com ordenação `busy` -> `available` -> `offline`, limite inicial de 5 itens e estado `expanded` para "Ver todos";
- Fallback para loading e resumo indisponível.

- [ ] **Step 4: Atualizar `AdminHomeScreen.tsx` e `AdminHomeScreen.test.tsx`**

- Remover a seção "Métricas da Operação" e seus cards fixos.
- Atualizar o teste de tela `AdminHomeScreen.test.tsx` para não esperar "Métricas da Operação" nem "Visitas Hoje", garantindo que as asserções verifiquem a nova seção "Equipe em campo".
- Migrar `AdminScheduleModal`, `ClientsScreen`, `ClientForm`, `ClientPicker` e `AdminHistoryScreen` para arquivos `.styles.ts` com tokens.

- [ ] **Step 5: Executar testes de admin e clientes**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx 'frontend/src/modules/admin/**/*.test.*' 'frontend/src/modules/clients/**/*.test.*'`  
Expected: PASS em todos os testes.

- [ ] **Step 6: Validar typecheck**

Run: `npm run typecheck:all`  
Expected: PASS em todos os workspaces.

---

### Task 7: Linter Automatizado de Tokens Visuais e Validação Completa

**Files:**
- Create: `frontend/src/shared/ui/token-lint.test.ts`

**Interfaces:**
- Produces: Teste automatizado que varre todo `frontend/src/**/*.styles.ts` e falha se encontrar:
  - Cores hexadecimais literais (regex `/#([0-9a-fA-F]{3,8})\b/` com exceção de `theme.ts`).
  - `fontSize` com número literal fora de `theme.ts`.
  - `borderRadius` com número literal fora de `theme.ts`.

- [ ] **Step 1: Escrever teste de conformidade de tokens em `token-lint.test.ts`**

```typescript
test("no styles file contains hardcoded hex colors, font sizes or border radii", () => {
  // Ler recursivamente arquivos *.styles.ts em frontend/src/
  // Ignorar theme.ts
  // Falhar com lista de arquivos e linhas infratoras se houver literais
});
```

- [ ] **Step 2: Rodar teste de conformidade de tokens**

Run: `node -r ./frontend/setup-tests.cjs --test --import tsx frontend/src/shared/ui/token-lint.test.ts`  
Expected: PASS (nenhum arquivo de estilo com valor solto).

- [ ] **Step 3: Executar a suíte de validação completa do projeto**

Run:
1. `npm test --workspaces` (Frontend: 103+ testes, Backend: 127 testes, Contracts: 10 testes).
2. `npm run typecheck:all`
3. `npm run db:check --workspace=@qqs/backend`  
Expected: Todos verdes.

- [ ] **Step 4: Verificação visual no Expo Web**

Testar telas em emulador/browser responsivo nas larguras:
- 320 px (iPhone SE / compact)
- 360 px (Android padrão)
- 412 px (Android moderno / grande)
- 1280 px (Desktop web: confirmar centralização com `maxWidth: 560`)
Registrar observações no relatório de entrega.
