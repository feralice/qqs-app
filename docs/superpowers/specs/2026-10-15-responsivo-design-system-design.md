# Layout responsivo e padronização visual do app

**Status:** Aguardando revisão da solicitante  
**Data:** 15/10/2026

## Objetivo

Fazer todas as telas do app funcionarem bem em qualquer largura de celular em retrato, de 320 px até os aparelhos grandes, e padronizar o visual com uma escala única de cor, espaçamento, raio e fonte. A versão web continua sendo apenas para desenvolvimento e demonstração: precisa só não ficar esticada.

O Resumo do dia do painel do supervisor ganha um visual novo, porque hoje é uma lista de textos sem estilo.

## Contexto

- O app não trata largura de tela: não há `useWindowDimensions` nem `maxWidth` em nenhum lugar.
- `StatCard` usa `minWidth: 150`; dois cartões lado a lado não cabem entre 320 e 340 px.
- Quase toda linha com `flexDirection: "row"` está sem `flexWrap`, e nomes longos de empresa ou técnico estouram a linha.
- Existem cerca de 25 cores hex soltas, 15 valores de espaçamento, 9 raios e 8 tamanhos de fonte espalhados em 1.580 linhas de estilo.
- Treze arquivos misturam estilo inline no JSX com arquivos `.styles.ts`.
- `theme.ts` tem só as 6 cores de marca, 3 espaçamentos e 1 raio.
- `AdminDashboardSummary` não tem estilo e ignora o campo `employees` que o contrato já entrega.
- A seção "Métricas da Operação" mostra valores fixos no código (`+15%`, `45 min`, `100%`), e "Visitas Hoje" exibe na verdade o total do período.

## Escopo

### Incluído

- Tokens de cor, espaçamento, raio e fonte em `theme.ts`.
- Peças de layout `useLayout`, `LayoutProvider`, `Screen` e `Grid`.
- Migração de todos os componentes e telas para tokens e para as regras de texto.
- Novo visual do Resumo do dia, com a seção Equipe em campo.
- Remoção das métricas falsas.
- Teste que impede valores visuais soltos nos arquivos de estilo.

### Fora deste incremento

- Modo paisagem e layout de tablet.
- Tema escuro.
- Mudanças de fluxo ou navegação.
- Módulos clicáveis do painel e ligação do histórico com a API (frente separada).
- Estoque de produtos (frente separada).

## Tokens

As 6 cores de marca permanecem com os mesmos nomes e valores, e o teste atual de `theme.test.ts` continua valendo.

### Cores semânticas

| Token | Valor | Substitui |
|---|---|---|
| `background` | `#F4F8FC` | fundo do `AppShell` |
| `text` | `#242424` | `#383838` |
| `textMuted` | `#64748B` | `#555E68` |
| `textSubtle` | `#94A3B8` | `#8A8F98` |
| `surface` | `#FFFFFF` | |
| `surfaceAlt` | `#F8FAFC` | `#F1F5F9` |
| `surfaceTint` | `#F0F7FD` | `#EBF5FC`, `#EFF6FF`, `#EBF3FA` |
| `border` | `#E2E8F0` | `#E2EEF8` |
| `borderStrong` | `#CBD5E1` | |
| `success` / `successBg` | `#27AE60` / `#EAFAF1` | `#1E8449` |
| `warning` / `warningBg` | `#F39C12` / `#FEF5E7` | |
| `danger` / `dangerBg` | `#C0392B` / `#FDEDEC` | |

### Escalas

- Espaçamento: `xxs 2`, `xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 24`, `xxl 32`. Valores intermediários (5, 6, 10, 14) arredondam para o vizinho mais próximo.
- Raio: `sm 8`, `md 12`, `lg 16`, `xl 20`, `pill 999`.
- Fonte: `xs 11`, `sm 12`, `md 14`, `lg 16`, `xl 20`, `display 26`, com pesos `regular`, `semibold` e `bold`. O tamanho 10 sobe para 11.

A escala de espaçamento renomeia os valores atuais: hoje `md = 16` e `lg = 24`; na nova, `md = 12`, `lg = 16` e `xl = 24`. Cada uso existente de `theme.spacing.md` e `theme.spacing.lg` deve ser trocado pelo token que preserva o tamanho em tela.

O app continua respeitando o tamanho de fonte configurado no sistema. Números grandes de cartão limitam a ampliação com `maxFontSizeMultiplier={1.3}` para não quebrar o layout.

## Peças de layout

Ficam em `src/shared/ui/layout/`.

### `layoutFor(width)` e `useLayout()`

`layoutFor` é uma função pura que devolve `{ width, size, gutter }`. Abaixo de 360 px o tamanho é `compact` e o `gutter` é 12; a partir de 360 px, `regular` com `gutter` 16.

`useLayout` aplica `layoutFor` à largura vinda de um `LayoutProvider`, quando existir, ou de `useWindowDimensions`. O provider serve para os testes fixarem a largura, já que o runner em Node não tem tela real.

### `Screen`

Container de conteúdo com `maxWidth: 560`, centralizado, e o `gutter` como padding lateral. Aceita `scroll` para envolver o conteúdo num `ScrollView` e `keyboard` para incluir o `KeyboardAvoidingView` usado em Login e Cadastro.

`AppShell` passa a usar `Screen` internamente, de modo que as quatro rotas com shell recebem o comportamento sem alteração. O header azul continua ocupando toda a largura; apenas o conteúdo é limitado. Login e Cadastro usam `Screen` diretamente.

### `Grid`

Recebe `columns` (padrão 2) e `gap`, distribuindo os filhos em colunas de mesma largura. Em `compact`, usa uma coluna. Substitui os `statsRow` montados à mão e elimina o `minWidth` do `StatCard`.

### Regras de texto

- Texto variável numa linha (nome de empresa, técnico, endereço) recebe `flexShrink: 1` e `numberOfLines`, para não empurrar ícones e selos para fora.
- Uma linha com vários selos ou botões usa `flexWrap: "wrap"`.
- Todo elemento clicável tem área de toque de pelo menos 44 px de altura.

## Resumo do dia

### Cabeçalho

Título "Resumo do dia" com a data. À direita, "Atualizado às HH:MM" em `textSubtle`. Com `isStale`, o horário vira um selo `warning` com ícone `cloud-offline`.

### Contagens

Quatro `StatCard` dentro de `Grid`:

| Cartão | Ícone | Cor |
|---|---|---|
| Agendadas | `calendar` | `corporateBlue` |
| Em andamento | `play-circle` | `aqua` |
| Concluídas | `checkmark-circle` | `success` |
| Atrasadas | `alert-circle` | `danger` quando maior que zero; `textSubtle` quando zero |

Sem nenhuma visita no dia, os cartões dão lugar a um bloco vazio com ícone e "Nenhuma visita para este dia".

### Alertas críticos

Cada alerta é uma linha clicável com fundo `dangerBg`, ícone por tipo, mensagem com até duas linhas e seta. Os ícones são `time` para `overdue`, `warning` para `problem` e `location` para `outside_radius`. O toque abre a visita, como hoje. A linha usa `accessibilityRole="button"` e um rótulo com a mensagem do alerta.

### Equipe em campo

Abaixo dos alertas, com o título "Equipe em campo · N técnicos". Cada técnico ocupa uma linha com o nome (uma linha, com reticências), um selo de status (`Em visita` em azul, `Disponível` em verde, `Offline` em cinza) e, quando ocupado, a quantidade de visitas ativas.

A lista segue a ordem em visita, disponível e offline. Mostra até cinco técnicos; "Ver todos (N)" expande a lista no mesmo lugar.

### Estados

O carregamento mostra cartões cinza no lugar dos números. A ausência de resumo mostra um bloco com "Resumo indisponível".

### Métricas da Operação

A seção é removida. "Visitas Hoje", "Tempo Médio" e "Precisão GPS" saem por usarem valores fixos ou errados; "Técnicos Ativos" passa a ser a contagem no título de Equipe em campo. As métricas voltam quando houver dado real.

## Migração

Cada etapa termina com testes e typecheck verdes:

1. Tokens, `layoutFor`, `useLayout`, `LayoutProvider`, `Screen` e `Grid`, com seus testes.
2. Componentes compartilhados: `Badge`, `Button`, `TextField`, `StatCard`, `WeekCalendarStrip`, `StaffPicker`, `PhotoEvidencePicker`, `LocationMap` e `ServiceReportCard`.
3. `AppShell`, Login e Cadastro.
4. Área do técnico: `VisitsScreen`, `VisitCard`, `VisitDetailsScreen`, `VisitTimer`, `ArrivalJustification` e `TechnicianCreateVisitModal`.
5. Área do supervisor: `AdminHomeScreen` com o novo Resumo do dia, `AdminScheduleModal`, `ClientsScreen`, `ClientForm`, `ClientPicker` e o visual do `AdminHistoryScreen`.

Em cada arquivo, números e cores soltos viram tokens, o estilo inline vai para o `.styles.ts` (exceto valores que dependem de props em tempo de execução) e as regras de texto são aplicadas.

## Testes

- `layoutFor` nas bordas 320, 359, 360 e 412.
- `Grid` com duas colunas em `regular` e uma em `compact`; `Screen` aplicando `maxWidth` e `gutter`.
- Resumo do dia: os testes atuais continuam valendo. Novos casos cobrem a cor de Atrasadas, o selo de dados desatualizados, o ícone por tipo de alerta, a ordem da equipe, o "Ver todos" e a ausência das métricas removidas.
- Teste de tokens: lê os arquivos `*.styles.ts` e falha ao encontrar cor hex, `fontSize` ou `borderRadius` numérico fora de `theme.ts`.
- Os testes de tela existentes precisam continuar passando sem afrouxar o que verificam. Se um texto mudar, o teste acompanha o texto, não perde a asserção.

Comandos ao fim de cada etapa: `npm test --workspace=@qqs/frontend` e `npm run typecheck:all`.

## Verificação visual

Os testes não provam que o layout ficou bom. Cada tela é conferida no Expo web com o DevTools em 320, 360 e 412 px, e em 1280 px para confirmar o conteúdo centralizado. A confirmação final em aparelho real, pelo Expo Go, fica com a solicitante; o relatório separa o que foi conferido do que ficou pendente.
