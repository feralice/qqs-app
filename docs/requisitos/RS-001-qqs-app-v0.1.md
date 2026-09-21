# Especificação de Requisitos de Software — QQS App

**Documento:** RS-001  
**Versão:** 0.1 — rascunho para validação  
**Data:** 20/09/2026  
**Status:** Em revisão pelo solicitante  
**Plataforma:** Aplicativo mobile  

## 1. Objetivo

Digitalizar a execução de visitas técnicas e checklists de sistemas de clientes, substituindo o preenchimento manual de PDFs por um formulário mobile com controle de chegada, execução, assinatura do cliente, geração de PDF e sincronização offline.

## 2. Fontes e nível de certeza

As fontes analisadas foram 13 áudios do WhatsApp, dois PDFs denominados `Check List_GASES DA AMAZONIA` e uma imagem de uma conversa contendo um checklist da Samsung.

- **Confirmado:** aparece de forma direta ou repetida nas fontes.
- **Interpretação:** entendimento provável que precisa ser validado.
- **Em aberto:** decisão necessária antes da implementação.

As transcrições automáticas estão em `transcricoes/`. Como há trechos com baixa inteligibilidade, termos técnicos devem ser conferidos contra os PDFs e com o solicitante antes de virar regra definitiva.

## 3. Escopo do produto

### 3.1 Incluído no MVP

- Aplicativo mobile para técnicos e supervisores/administradores.
- Login de funcionários e de usuários administrativos.
- Cadastro e seleção de clientes.
- Cadastro de sistemas/equipamentos por cliente, com quantidade variável.
- Modelos de checklist por tipo de sistema.
- Atribuição de clientes/serviços a funcionários.
- Registro de chegada, início e saída da visita.
- Registro do funcionário e de outras pessoas presentes na visita.
- Preenchimento digital do checklist.
- Assinatura do cliente na tela do celular ao final.
- Geração de PDF preenchido para o cliente.
- Operação offline e sincronização posterior.

### 3.2 Fora do MVP

- Painel web.
- Microserviços.
- Integração com ERP, estoque ou sistemas externos.
- Pagamentos e faturamento.
- Geolocalização obrigatória, caso não seja confirmada.
- Assinatura digital com certificado ICP-Brasil.

## 4. Atores

| Ator | Responsabilidade |
|---|---|
| Técnico/funcionário | Receber serviços, registrar chegada, executar checklist, coletar assinatura e sincronizar dados. |
| Supervisor/administrador | Gerenciar funcionários, clientes, sistemas, modelos de checklist, atribuições e consultar relatórios. |
| Cliente/representante | Confirmar a execução da visita e assinar o relatório no dispositivo. |
| Serviço de sincronização | Enviar dados locais ao backend quando houver conexão e informar falhas. |

## 5. Fluxo principal

1. O usuário entra no aplicativo.
2. O app apresenta os clientes/serviços atribuídos ao usuário.
3. O usuário seleciona o cliente e confirma a chegada.
4. O app registra data e hora da chegada.
5. O usuário seleciona os sistemas/equipamentos do cliente.
6. O usuário preenche o checklist padrão de cada sistema.
7. O usuário registra medições, produtos, dosagens, estoque e observações quando aplicável.
8. O usuário encerra a visita; o app registra data e hora da saída.
9. O cliente ou representante assina na tela.
10. O app salva a visita localmente e tenta sincronizá-la.
11. O backend gera o PDF da visita por cliente.

## 6. Requisitos funcionais

### Autenticação e permissões

- **RF-001 — Login de funcionários:** o sistema deve permitir autenticação de funcionários.
- **RF-002 — Login administrativo:** o sistema deve permitir autenticação de usuários administrativos/supervisores.
- **RF-003 — Perfis:** o sistema deve restringir ações conforme o perfil autenticado.
- **RF-004 — Identificação de usuário:** cada registro de visita deve manter o usuário que o executou.

### Clientes e sistemas

- **RF-005 — Clientes:** o administrador deve cadastrar, editar, ativar e inativar clientes.
- **RF-006 — Sistemas por cliente:** o administrador deve associar um ou mais sistemas/equipamentos a cada cliente.
- **RF-007 — Quantidade variável:** um cliente deve poder possuir quantidades diferentes de cada tipo de sistema.
- **RF-008 — Identificação:** cada unidade deve possuir nome ou código identificador, por exemplo Torre 1, Torre 2 ou Caldeira 1.
- **RF-009 — Tipos padronizados:** o sistema deve permitir modelos diferentes para tipos de sistema diferentes.

### Funcionários e atribuições

- **RF-010 — Funcionários:** o administrador deve cadastrar e inativar funcionários.
- **RF-011 — Disponibilidade:** o sistema deve registrar a disponibilidade dos funcionários para apoiar a distribuição dos serviços.
- **RF-012 — Atribuição:** o administrador deve atribuir clientes ou visitas a um ou mais funcionários.
- **RF-013 — Histórico:** a troca de funcionário não deve apagar o histórico das visitas anteriores.

### Visitas e controle de presença

- **RF-014 — Início da visita:** o técnico deve confirmar a chegada ao cliente no aplicativo.
- **RF-015 — Horário de entrada:** o sistema deve registrar automaticamente a data e hora da chegada.
- **RF-016 — Horário de saída:** o sistema deve registrar automaticamente a data e hora do encerramento.
- **RF-017 — Participantes:** o técnico deve poder registrar com quem estava ou quem acompanhou a visita.
- **RF-018 — Identificação do executante:** a visita deve indicar quais funcionários participaram da execução.

### Checklists

- **RF-019 — Formulário digital:** o técnico deve preencher o checklist pelo celular.
- **RF-020 — Checklist por sistema:** o formulário exibido deve corresponder ao tipo de sistema/equipamento selecionado.
- **RF-021 — Campos de inspeção:** o formulário deve suportar campos de seleção, texto, número, data/hora e observação.
- **RF-022 — Dados operacionais:** o formulário deve suportar registros de coleta, dosagem, produtos e estoque, conforme o modelo aplicável.
- **RF-023 — Modelos:** o administrador deve poder manter modelos distintos para os diferentes tipos de sistema.
- **RF-024 — Salvamento parcial:** o técnico deve poder salvar uma visita incompleta e continuar depois.
- **RF-025 — Validação:** o sistema deve impedir o encerramento quando campos obrigatórios não forem preenchidos.

### Assinatura e relatório

- **RF-026 — Assinatura no dispositivo:** o cliente/representante deve assinar diretamente na tela do celular.
- **RF-027 — Confirmação:** o app deve permitir revisar os dados antes da assinatura.
- **RF-028 — PDF por cliente:** o sistema deve gerar um PDF preenchido associado ao cliente e à visita.
- **RF-029 — Conteúdo do PDF:** o PDF deve conter dados do cliente, sistemas vistoriados, respostas, medições, horários, participantes, observações e assinatura.
- **RF-030 — Compartilhamento:** o usuário deve poder compartilhar o PDF por meio do sistema operacional, incluindo WhatsApp quando disponível.

### Operação offline e sincronização

- **RF-031 — Uso offline:** o técnico deve conseguir abrir e preencher uma visita sem conexão com a internet.
- **RF-032 — Persistência local:** respostas, horários, assinatura e anexos devem ser preservados localmente até a sincronização.
- **RF-033 — Fila de sincronização:** o app deve manter uma fila de registros pendentes.
- **RF-034 — Retentativa:** falhas temporárias de sincronização devem poder ser repetidas sem duplicar a visita.
- **RF-035 — Estados:** cada visita deve indicar se está em rascunho, pendente, sincronizada ou com erro.
- **RF-036 — Integridade:** o backend deve aceitar operações idempotentes para impedir duplicidade durante retentativas.

## 7. Requisitos não funcionais

- **RNF-001 — Plataforma:** o aplicativo deve ser desenvolvido em React Native com Expo e TypeScript.
- **RNF-002 — Backend:** a API deve ser desenvolvida em Express com TypeScript.
- **RNF-003 — Arquitetura:** o backend deve ser um monólito modular com princípios de Clean Architecture, sem microserviços no MVP.
- **RNF-004 — Persistência:** o backend deve usar banco relacional; PostgreSQL é a opção recomendada.
- **RNF-005 — Validação:** entradas da API devem ser validadas no limite da aplicação.
- **RNF-006 — Segurança:** senhas devem ser armazenadas com hash; tokens devem possuir expiração e renovação segura.
- **RNF-007 — Privacidade:** dados de clientes, funcionários e assinaturas devem ser protegidos por autenticação e autorização.
- **RNF-008 — Auditoria:** alterações relevantes devem registrar usuário, data e hora.
- **RNF-009 — Confiabilidade offline:** uma visita salva localmente não pode ser perdida por falta de rede ou fechamento do app.
- **RNF-010 — Usabilidade:** o preenchimento deve ser otimizado para uso em campo, com poucos passos e feedback claro de sincronização.
- **RNF-011 — Testabilidade:** casos de uso, regras de sincronização e geração de relatório devem possuir testes automatizados.

## 8. Modelo conceitual inicial

Entidades previstas:

- `User`: usuário, perfil, credenciais e status.
- `EmployeeAvailability`: disponibilidade do funcionário.
- `Client`: cliente e dados de identificação.
- `SystemType`: tipo padronizado de sistema.
- `ClientSystem`: unidade de sistema pertencente a um cliente.
- `ChecklistTemplate`: modelo de checklist versionado.
- `ChecklistItem`: item e tipo de resposta do modelo.
- `Visit`: visita, horários, cliente, status e participantes.
- `VisitResponse`: resposta do técnico a um item.
- `Signature`: assinatura do cliente e dados de confirmação.
- `SyncOperation`: operação local pendente ou sincronizada.
- `Report`: PDF gerado e metadados de entrega.

## 9. Critérios de aceitação do MVP

- Um administrador consegue cadastrar um cliente com duas torres e uma caldeira.
- Um administrador consegue atribuir a visita a funcionários disponíveis.
- Um técnico consegue iniciar a visita sem internet e registrar o horário de chegada.
- O técnico consegue preencher os checklists dos sistemas cadastrados.
- O técnico consegue encerrar a visita e coletar assinatura na tela.
- O app preserva os dados após ser fechado sem conexão.
- Ao recuperar a conexão, a visita é sincronizada uma única vez.
- O sistema gera um PDF contendo os dados preenchidos e a assinatura.
- O usuário consegue compartilhar o PDF pelo celular.
- Um supervisor consegue consultar a visita sincronizada pelo aplicativo.

## 10. Regras e decisões ainda em aberto

- **RA-001:** confirmar os nomes técnicos dos sistemas citados nos áudios, pois a transcrição automática pode ter interpretado termos incorretamente.
- **RA-002:** confirmar se o PDF é gerado por cada visita, por cliente, ou se deve consolidar várias visitas do mesmo cliente.
- **RA-003:** definir se o administrador cria/edita modelos de checklist no app ou se os modelos serão cadastrados inicialmente pelo desenvolvimento.
- **RA-004:** definir se a assinatura terá validade apenas como confirmação visual ou se haverá requisito jurídico adicional.
- **RA-005:** definir se localização GPS será obrigatória, opcional ou não fará parte do MVP.
- **RA-006:** definir campos exatos, obrigatoriedades e unidades de medida de cada checklist a partir dos PDFs originais.
- **RA-007:** definir se o cliente receberá o PDF por WhatsApp, e-mail, compartilhamento manual ou mais de uma opção.
- **RA-008:** definir se o login por telefone usará senha, código SMS ou ambos.
- **RA-009:** definir o comportamento quando dois funcionários editarem a mesma visita.

## 11. Rastreabilidade das fontes

| Evidência | Requisitos relacionados |
|---|---|
| Áudio 1 | RF-014, RF-015, RF-017 |
| Áudios 2, 3, 4 e 7 | RF-019, RF-026, RF-028, RF-029 |
| Áudio 5 e áudio principal | RF-006, RF-007, RF-008, RF-009, RF-022 |
| Áudio 6 | RF-028 e RA-002 |
| Áudios 8 e 9 | RF-015, RF-016, RF-017 |
| Áudios 10, 11 e 12 | RF-001, RF-002, RF-010, RF-011, RF-012 |
| PDFs e imagem | Validação visual dos campos e do layout do checklist; RA-006 |

## 12. Próxima etapa

Validar este documento com o solicitante, resolver as decisões em aberto e produzir a versão 1.0 aprovada. Somente depois devem ser escritos o documento de arquitetura e o plano de implementação do app mobile e da API.

