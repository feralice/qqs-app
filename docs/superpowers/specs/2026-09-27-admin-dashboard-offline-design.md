# Design: Painel administrativo offline-first

## Objetivo

Melhorar a experiência dos administradores do QQS App, priorizando o uso em
celular e permitindo acompanhar e resolver a operação de visitas técnicas
mesmo sem conexão estável.

## Escopo aprovado

- Dashboard diário com visitas agendadas, em andamento, concluídas e atrasadas.
- Alertas de problemas e atrasos.
- Visibilidade do estado dos técnicos.
- Indicadores de produtividade e tempo médio.
- Ações diretas para reagendar, trocar o técnico, abrir evidências e resolver
  alertas.
- Funcionamento offline para consulta e ações administrativas.
- Sincronização automática ao recuperar a conexão, com estado visível.
- Histórico filtrável por data, técnico, status e cliente.
- Notificações push para eventos operacionais.
- WhatsApp automático para atrasos e problemas, enviado a todos os
  administradores.

## Usuários e contexto

O público prioritário é formado por vários administradores com o mesmo nível
de acesso. O uso principal será em celulares. A escala diária ainda não foi
informada, portanto a solução deve evitar depender de uma quantidade fixa de
visitas.

## Experiência do dashboard

A tela inicial deve seguir esta ordem:

1. Resumo do dia com cards de status.
2. Alertas críticos no topo.
3. Agenda do dia com filtros.
4. Técnicos disponíveis e ocupados.
5. Atalhos para reagendar, trocar responsável e abrir detalhes.
6. Indicadores de produtividade.

O dashboard deve exibir a última atualização dos dados e o estado de
sincronização de ações locais.

## Arquitetura proposta

### Frontend

- Evoluir `AdminHomeScreen` para o dashboard operacional.
- Reutilizar componentes existentes de cards, badges, calendário e detalhes.
- Estender `VisitStore` para leitura consistente de dados persistidos.
- Estender `SyncQueue` para ações administrativas idempotentes.
- Adicionar armazenamento local persistente para cache e operações pendentes.
- Exibir estados `sincronizado`, `pendente` e `erro` em ações relevantes.

### Backend

- Criar consultas agregadas para o resumo diário.
- Criar endpoints para reagendamento, troca de técnico e resolução de alertas.
- Persistir histórico de alterações e eventos operacionais.
- Garantir idempotência por identificador de operação.
- Fornecer dados suficientes para reconstruir o cache local após sincronização.

### Notificações

- Gerar eventos para visita atrasada, problema informado, visita criada ou
  alterada, visita iniciada e visita finalizada.
- Enviar push para os administradores.
- Enviar automaticamente pelo WhatsApp apenas atrasos e problemas.
- Usar identificadores únicos para impedir notificações duplicadas.
- Registrar falhas e tentativas de entrega.

## Offline e conflitos

O frontend armazenará localmente o resumo, a agenda, os técnicos e as visitas
recentes. Reagendamentos, trocas de técnico, resolução de alertas e registros
de contato serão enfileirados quando não houver conexão.

Ao recuperar a conexão, a fila será processada automaticamente. Falhas
permanecerão visíveis para nova tentativa. Conflitos não serão sobrescritos
silenciosamente; serão sinalizados para revisão do administrador.

O envio efetivo de WhatsApp exige conexão, mas a tentativa e seu estado ficarão
registrados localmente até a sincronização.

## Histórico e filtros

O histórico deverá permitir filtrar por:

- Intervalo de datas.
- Técnico.
- Status da visita.
- Cliente.

Os resultados devem abrir os detalhes da visita, suas evidências, localização,
alterações e estado de sincronização.

## Tratamento de erros

- Erros de rede não devem apagar dados locais.
- Ações offline devem ser apresentadas como pendentes, não como concluídas no
  servidor.
- Operações duplicadas devem ser ignoradas pelo identificador de operação.
- Falhas persistentes devem oferecer nova tentativa e informação legível.
- O dashboard deve diferenciar zero resultados de dados ainda não carregados.

## Testes de aceitação

- O administrador identifica o estado do dia ao abrir o app.
- Um atraso aparece no resumo e gera push e WhatsApp.
- Uma ação feita offline permanece visível como pendente.
- A ação pendente é sincronizada ao recuperar conexão.
- Uma falha de sincronização pode ser repetida sem duplicar a alteração.
- O histórico retorna resultados corretos para cada filtro.
- Vários administradores recebem os alertas configurados.

## Fora do escopo desta etapa

- Definição do provedor de WhatsApp.
- Regras de permissões diferentes entre administradores.
- Quantidade final de visitas suportada por dia.
- Comportamento definitivo de mensagens de contato feitas offline.
