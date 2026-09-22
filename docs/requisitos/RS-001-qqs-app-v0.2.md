# Especificação de Requisitos de Software — QQS App

**Documento:** RS-001
**Versão:** 0.2 — mesclagem com a proposta "Sistema de Gestão de Visitas Técnicas"
**Data:** 21/09/2026
**Status:** Em revisão pelo solicitante
**Plataforma:** Aplicativo mobile único, com telas de técnico e telas de administrador no mesmo app

## 1. Objetivo

Digitalizar a execução de visitas técnicas a clientes, substituindo relatórios manuais em papel por um fluxo mobile com check-in e check-out geolocalizados, evidências fotográficas, assinatura do cliente e sincronização offline. O administrador acompanha, cadastra e audita pelo mesmo aplicativo, sem painel web.

## 2. Fontes e nível de certeza

Fontes analisadas: 13 áudios do WhatsApp, dois PDFs `Check List_GASES DA AMAZONIA`, uma imagem de checklist da Samsung e a proposta "Sistema de Gestão de Visitas Técnicas" apresentada em 21/09/2026. As duas fontes têm pontos divergentes; esta versão registra onde uma resolveu uma pendência da outra e onde o conflito segue em aberto.

- **Confirmado:** aparece de forma direta ou repetida nas fontes, ou está listado como definido na proposta.
- **Interpretação:** entendimento provável que precisa ser validado.
- **Em aberto:** decisão necessária antes da implementação.

As transcrições automáticas estão em `transcricoes/`. Termos técnicos devem ser conferidos contra os PDFs e com o solicitante antes de virar regra definitiva.

## 3. Escopo do produto

### 3.1 Incluído no MVP

- Aplicativo mobile único, com telas de técnico e telas de administrador conforme o perfil autenticado.
- Telas administrativas dentro do mesmo app: visão geral, mapa operacional, cadastros, auditoria e relatórios.
- Login de funcionários e de usuários administrativos, por e-mail e senha.
- Cadastro de empresas/clientes com razão social, CNPJ, endereço, coordenadas e raio permitido.
- Cadastro de sistemas/equipamentos por cliente, com quantidade variável.
- Modelos de checklist por tipo de sistema.
- Check-in com data, hora, latitude, longitude e distância até o cliente; se fora do raio, exige justificativa e a visita fica destacada para conferência do gestor.
- Registro do funcionário e de outros funcionários presentes como acompanhantes.
- Preenchimento digital do checklist, com descrição do serviço executado e fotos como evidência.
- Check-out com horário, localização e duração total da visita.
- Geração de PDF preenchido para o cliente e exportação de relatórios em PDF e CSV pelo próprio app.
- Operação offline no app mobile e sincronização posterior.

### 3.2 Fora do MVP

- Painel web separado; tudo roda no aplicativo mobile.
- Microserviços.
- Integração com ERP, estoque ou sistemas externos.
- Pagamentos e faturamento.
- Assinatura digital com certificado ICP-Brasil.
- Agendamento de visitas futuras (a confirmar; ver seção 10).

## 4. Atores

| Ator | Responsabilidade |
|---|---|
| Técnico de campo | Escolher a empresa a visitar, fazer check-in e check-out, registrar serviço executado, fotos e acompanhantes, coletar assinatura e sincronizar dados. |
| Gestor/administrador | Cadastrar empresas, sistemas, funcionários e modelos de checklist; acompanhar visitas do dia, auditar registros e exportar relatórios, tudo pelo mesmo aplicativo mobile. |
| Cliente/representante | Confirmar a execução da visita e assinar o relatório no dispositivo, quando aplicável. |
| Serviço de sincronização | Enviar dados locais ao backend quando houver conexão e informar falhas. |

## 5. Fluxo principal (app mobile)

1. O técnico entra no aplicativo com e-mail e senha.
2. O técnico pesquisa e seleciona uma empresa cadastrada.
3. O técnico faz check-in; o app registra data, hora, latitude, longitude e distância até o endereço cadastrado.
4. Se a distância exceder o raio permitido, o app solicita uma justificativa; a visita segue liberada, mas marcada para conferência.
5. O técnico seleciona outros funcionários presentes como acompanhantes.
6. O técnico seleciona os sistemas/equipamentos do cliente e preenche o checklist de cada um.
7. O técnico descreve o serviço executado e anexa fotos como evidência.
8. O técnico registra medições, produtos, dosagens, estoque e observações quando aplicável.
9. O técnico faz check-out; o app registra horário, localização e duração total.
10. O cliente ou representante assina na tela, quando essa etapa for exigida (ver RA-004).
11. O app salva a visita localmente e tenta sincronizá-la.
12. O backend gera o PDF da visita por cliente.

## 6. Requisitos funcionais

### Autenticação e permissões

- **RF-001 — Login de funcionários:** o sistema deve permitir autenticação de funcionários por e-mail e senha.
- **RF-002 — Login administrativo:** o sistema deve permitir autenticação de usuários administrativos/gestores por e-mail e senha.
- **RF-003 — Perfis:** o sistema deve restringir ações conforme o perfil autenticado (técnico ou administrador).
- **RF-004 — Identificação de usuário:** cada registro de visita deve manter o usuário que o executou.

### Empresas/clientes e sistemas

- **RF-005 — Cadastro de empresas:** o administrador deve cadastrar, editar, ativar e inativar empresas, com razão social, CNPJ, endereço, coordenadas e raio permitido.
- **RF-006 — Sistemas por cliente:** o administrador deve associar um ou mais sistemas/equipamentos a cada empresa.
- **RF-007 — Quantidade variável:** uma empresa deve poder possuir quantidades diferentes de cada tipo de sistema.
- **RF-008 — Identificação:** cada unidade deve possuir nome ou código identificador, por exemplo Torre 1, Torre 2 ou Caldeira 1.
- **RF-009 — Tipos padronizados:** o sistema deve permitir modelos diferentes para tipos de sistema diferentes.

### Funcionários e escolha de empresa

- **RF-010 — Funcionários:** o administrador deve cadastrar, editar e inativar funcionários, definindo o perfil de acesso.
- **RF-011 — Disponibilidade:** o sistema deve registrar a disponibilidade dos funcionários para apoiar a distribuição dos serviços.
- **RF-012 — Seleção de empresa:** o técnico deve poder pesquisar e escolher livremente qual empresa cadastrada vai visitar. Isso coexiste com a atribuição feita pelo administrador (RF-012a): o técnico vê as empresas atribuídas a ele e também pode abrir qualquer outra empresa ativa.
- **RF-012a — Atribuição pelo administrador:** o administrador deve poder atribuir uma empresa/visita a um ou mais técnicos; a atribuição é uma sugestão de prioridade, não um bloqueio para o técnico escolher outra empresa.
- **RF-013 — Histórico:** a troca de funcionário não deve apagar o histórico das visitas anteriores.

### Visitas, check-in e check-out

- **RF-014 — Check-in:** o técnico deve confirmar a chegada à empresa no aplicativo.
- **RF-015 — Geolocalização do check-in:** o sistema deve registrar automaticamente data, hora, latitude, longitude e a distância até o endereço cadastrado da empresa.
- **RF-016 — Validação de raio:** quando a distância exceder o raio permitido, o app deve exigir justificativa obrigatória antes de continuar; a visita não é bloqueada, mas fica destacada para o gestor.
- **RF-017 — Check-out:** o sistema deve registrar automaticamente data, hora, localização e duração total da visita.
- **RF-018 — Acompanhantes:** o técnico deve poder selecionar outros funcionários presentes como acompanhantes da visita.
- **RF-019 — Identificação do executante:** a visita deve indicar quais funcionários participaram da execução.

### Checklists e evidências

- **RF-020 — Formulário digital:** o técnico deve preencher o checklist pelo celular.
- **RF-021 — Checklist por sistema:** o formulário exibido deve corresponder ao tipo de sistema/equipamento selecionado.
- **RF-022 — Campos de inspeção:** o formulário deve suportar campos de seleção, texto, número, data/hora e observação.
- **RF-023 — Dados operacionais:** o formulário deve suportar registros de coleta, dosagem, produtos e estoque, conforme o modelo aplicável.
- **RF-024 — Descrição do serviço:** o técnico deve poder descrever em texto livre o serviço executado.
- **RF-025 — Fotos:** o técnico deve poder anexar fotos como evidência do serviço, vinculadas à visita (ver RA-011 sobre obrigatoriedade).
- **RF-026 — Modelos:** o administrador deve poder manter modelos distintos para os diferentes tipos de sistema.
- **RF-027 — Salvamento parcial:** o técnico deve poder salvar uma visita incompleta e continuar depois.
- **RF-028 — Validação:** o sistema deve impedir o encerramento quando campos obrigatórios não forem preenchidos.

### Assinatura e relatório

- **RF-029 — Assinatura no dispositivo:** quando exigida, o cliente/representante deve assinar diretamente na tela do celular (ver RA-004).
- **RF-030 — Confirmação:** o app deve permitir revisar os dados antes do check-out.
- **RF-031 — PDF por visita:** o sistema deve gerar um PDF preenchido associado à empresa e à visita.
- **RF-032 — Conteúdo do PDF:** o PDF deve conter dados da empresa, sistemas vistoriados, respostas, medições, horários, acompanhantes, fotos, observações e assinatura quando houver.
- **RF-033 — Compartilhamento:** o usuário deve poder compartilhar o PDF pelo sistema operacional, incluindo WhatsApp quando disponível.

### Telas administrativas (dentro do app mobile)

- **RF-034 — Visão geral:** as telas de administrador devem exibir as visitas do dia, técnicos ativos, ocorrências fora do raio e atividades recentes.
- **RF-035 — Mapa operacional:** o administrador deve visualizar a localização registrada nos check-ins e as empresas atendidas em um mapa, dentro do app.
- **RF-036 — Auditoria:** o gestor deve conseguir abrir uma visita e visualizar fotos, horários, distância, justificativa, descrição e participantes.
- **RF-037 — Relatórios:** o administrador deve conseguir filtrar visitas por período, empresa, técnico e status, com exportação em PDF e CSV.
- **RF-038 — Correção de visita:** definir se o gestor pode corrigir diretamente uma visita ou apenas solicitar ajuste ao técnico (ver RA-012).

### Operação offline e sincronização

- **RF-039 — Uso offline:** o técnico deve conseguir abrir e preencher uma visita sem conexão com a internet.
- **RF-040 — Persistência local:** respostas, horários, fotos, assinatura e anexos devem ser preservados localmente até a sincronização.
- **RF-041 — Fila de sincronização:** o app deve manter uma fila de registros pendentes.
- **RF-042 — Retentativa:** falhas temporárias de sincronização devem poder ser repetidas sem duplicar a visita.
- **RF-043 — Estados:** cada visita deve indicar se está em rascunho, pendente, sincronizada ou com erro.
- **RF-044 — Integridade:** o backend deve aceitar operações idempotentes para impedir duplicidade durante retentativas.

## 7. Requisitos não funcionais

- **RNF-001 — Plataforma mobile:** o aplicativo deve ser desenvolvido em React Native com Expo e TypeScript, único para técnico e administrador.
- **RNF-003 — Backend:** a API deve ser desenvolvida em Express com TypeScript.
- **RNF-004 — Arquitetura:** o backend deve ser um monólito modular com princípios de Clean Architecture, sem microserviços no MVP.
- **RNF-005 — Persistência:** o backend deve usar banco relacional; PostgreSQL é a opção recomendada.
- **RNF-006 — Validação:** entradas da API devem ser validadas no limite da aplicação.
- **RNF-007 — Segurança:** senhas devem ser armazenadas com hash; tokens devem possuir expiração e renovação segura.
- **RNF-008 — Privacidade:** dados de clientes, funcionários, fotos e assinaturas devem ser protegidos por autenticação e autorização.
- **RNF-009 — Auditoria:** alterações relevantes devem registrar usuário, data e hora.
- **RNF-010 — Confiabilidade offline:** uma visita salva localmente não pode ser perdida por falta de rede ou fechamento do app.
- **RNF-011 — Usabilidade:** o preenchimento deve ser otimizado para uso em campo, com botões grandes, alto contraste, textos diretos e poucos passos.
- **RNF-012 — Testabilidade:** casos de uso, regras de sincronização e geração de relatório devem possuir testes automatizados.

## 8. Modelo conceitual inicial

Entidades previstas:

- `User`: usuário, perfil, credenciais e status.
- `EmployeeAvailability`: disponibilidade do funcionário.
- `Client`: empresa, CNPJ, endereço, coordenadas e raio permitido.
- `SystemType`: tipo padronizado de sistema.
- `ClientSystem`: unidade de sistema pertencente a uma empresa.
- `ChecklistTemplate`: modelo de checklist versionado.
- `ChecklistItem`: item e tipo de resposta do modelo.
- `Visit`: visita, horários de check-in/check-out, geolocalização, distância, justificativa, empresa, status e acompanhantes.
- `VisitResponse`: resposta do técnico a um item do checklist.
- `VisitPhoto`: foto anexada como evidência, vinculada à visita.
- `Signature`: assinatura do cliente e dados de confirmação.
- `SyncOperation`: operação local pendente ou sincronizada.
- `Report`: PDF ou CSV gerado e metadados de entrega.

## 9. Critérios de aceitação do MVP

- Um administrador consegue cadastrar uma empresa com duas torres e uma caldeira, incluindo CNPJ, endereço, coordenadas e raio permitido.
- Um técnico consegue pesquisar e escolher uma empresa, sem depender de atribuição prévia.
- Um técnico consegue fazer check-in sem internet e o app registra localização e distância.
- Fora do raio permitido, o app exige justificativa antes de liberar a visita.
- O técnico consegue preencher os checklists, descrever o serviço e anexar fotos.
- O técnico consegue fazer check-out e coletar assinatura quando exigida.
- O app preserva os dados após ser fechado sem conexão.
- Ao recuperar a conexão, a visita é sincronizada uma única vez.
- O sistema gera um PDF contendo os dados preenchidos, fotos e assinatura quando houver.
- Um gestor consegue abrir as telas administrativas no app, ver as visitas do dia num mapa e auditar uma visita sincronizada.
- Um gestor consegue exportar um relatório filtrado em PDF e CSV, pelo app.

## 10. Regras e decisões ainda em aberto

- **RA-001:** confirmar os nomes técnicos dos sistemas citados nos áudios, pois a transcrição automática pode ter interpretado termos incorretamente.
- **RA-002:** confirmar se o PDF é gerado por cada visita, por cliente, ou se deve consolidar várias visitas do mesmo cliente.
- **RA-003:** definir se o administrador cria/edita modelos de checklist no app/painel ou se os modelos serão cadastrados inicialmente pelo desenvolvimento.
- **RA-004:** a assinatura do cliente será obrigatória ou opcional? A RS-001 original previa obrigatória; a proposta nova deixou como pergunta em aberto.
- **RA-005:** ~~definir se localização GPS será obrigatória~~ — resolvido pela proposta nova: GPS confirmado, com validação de raio e justificativa quando fora dele.
- **RA-006:** definir campos exatos, obrigatoriedades e unidades de medida de cada checklist a partir dos PDFs originais.
- **RA-007:** definir se o cliente receberá o PDF por WhatsApp, e-mail, compartilhamento manual ou mais de uma opção.
- **RA-008:** ~~login por telefone com senha ou SMS~~ — resolvido pela proposta nova: e-mail e senha.
- **RA-009:** definir o comportamento quando dois funcionários editarem a mesma visita.
- **RA-010:** ~~técnico escolhe livre ou admin atribui~~ — resolvido: os dois coexistem (RF-012 e RF-012a). Admin pode atribuir como prioridade/sugestão; técnico pode escolher qualquer empresa ativa mesmo sem atribuição.
- **RA-011 (novo):** a descrição do serviço e ao menos uma foto serão obrigatórias para o check-out?
- **RA-012 (novo):** o gestor poderá corrigir uma visita diretamente pelo painel ou apenas solicitar ajuste ao técnico?
- **RA-013:** ~~stack do painel web~~ — não se aplica: não haverá painel web. Técnico e administrador usam o mesmo aplicativo mobile, com telas diferentes por perfil.
- **RA-014 (novo):** será necessário agendar visitas futuras ou o app trabalha apenas com visitas livres no momento da execução?

## 11. Rastreabilidade das fontes

| Evidência | Requisitos relacionados |
|---|---|
| Áudio 1 | RF-014, RF-015, RF-018 |
| Áudios 2, 3, 4 e 7 | RF-020, RF-029, RF-031, RF-032 |
| Áudio 5 e áudio principal | RF-006, RF-007, RF-008, RF-009, RF-023 |
| Áudio 6 | RF-031 e RA-002 |
| Áudios 8 e 9 | RF-015, RF-017, RF-018 |
| Áudios 10, 11 e 12 | RF-001, RF-002, RF-010, RF-011, RF-012 |
| PDFs e imagem | Validação visual dos campos e do layout do checklist; RA-006 |
| Proposta "Sistema de Gestão de Visitas Técnicas" (21/09/2026) | RF-012, RF-015, RF-016, RF-018, RF-024, RF-025, RF-029, RF-034 a RF-038, RA-004, RA-005, RA-008, RA-010 a RA-014 |

## 12. Próxima etapa

RA-010 e RA-013 já resolvidas junto com o solicitante. Seguir para a implementação começando pela autenticação (login de técnico e de administrador no mesmo app), base do restante do fluxo.
