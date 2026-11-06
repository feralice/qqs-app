# Roteiro de entrevista: estoque de produtos

**Documento:** ENT-001
**Data de criação:** 16/10/2026
**Entrevistado:** Fernando André de Oliveira Duarte (solicitante, diretoria QQS)
**Data das respostas:** 20/10/2026, por escrito
**Status:** Respondida
**Requisito relacionado:** RF-023 (dados operacionais: coleta, dosagem, produtos e estoque) da RS-001 v0.2

## Contexto

O estoque de produtos ainda não existe no app. Nas fontes da RS-001, ele aparece em uma única fala, no áudio de 20/09/2026 sobre a Gases da Amazônia: "passar nos sistemas e verificar que cada sistema coleta, coleta, coleta, dosagem, aí produtos, né? Stock". A RS-001 deixa integração com estoque ou ERP fora do MVP, então a intenção provável era registrar o estoque durante a visita, e não montar um controle de estoque completo. Esta entrevista serviu para confirmar isso antes de implementar.

As respostas foram além do estoque: descrevem o checklist completo da visita, o cadastro de programas de tratamento por cliente e o uso offline nas plantas. O resumo do impacto está na seção final.

## Perguntas

### 1. Como é hoje na visita

1. Me conta a última visita que você fez: chegando lá, o que você faz com os produtos químicos da empresa?
   - Resposta: o atendimento é por sistema. O técnico percorre os pontos daquele cliente (torre de resfriamento 1, torre 2, caldeira, chiller, circuito fechado etc.). Em cada sistema existe uma rotina de dosagem definida no programa de tratamento, em litros por dia de cada produto, e o técnico regula as bombas dosadoras para manter essa dosagem. O ajuste ocorre quando um resultado analítico sai da faixa de controle: fosfato baixo leva a aumentar o produto à base de fosfato; microbiológico fora leva a uma dosagem de choque do microbiocida. Além de dosar, o técnico faz análises de campo, inspeciona o aspecto do sistema (algas, limo, depósitos, condição da bacia), faz descarga de fundo para controlar o ciclo de concentração, cuida dos cupons de corrosão (data de entrada e de saída do corpo de prova) e coleta amostra para ensaio microbiológico.
2. Você conta quanto tem de cada produto, só olha por cima, ou anota o que repôs?
   - Resposta: anota. No checklist registra quanto dosou de cada produto e quanto ficou de estoque no cliente. Hoje isso depende da disciplina de cada técnico, e já houve cliente com produto zerado sem aviso, parada do tratamento e reclamação. A orientação interna é levantar estoque em toda visita; no app, deve ser etapa obrigatória antes de encerrar.
3. Onde isso fica anotado hoje: no papel do checklist, no WhatsApp, numa planilha?
   - Resposta: no papel, em checklist impresso personalizado por cliente. O formulário traz cabeçalho (cliente, endereço, data), lembrete de EPIs e atividades organizadas pelos sistemas do cliente. Para cada sistema há: situação (em operação ou fora de operação), dosagem e preparo de soluções por produto, análises de campo com a faixa de controle impressa ao lado (exemplos: pH 6,8 a 8,2 na torre; pH 8,0 a 10,0 e nitrito 200 a 400 ppm no chiller), itens de inspeção, datas do cupom de corrosão e da coleta microbiológica, quadro de controle de estoque (produto e quantidade) e campo livre de observações. No fim, assinatura do técnico e do responsável do cliente. O técnico escaneia o papel e envia no grupo de WhatsApp da operação, junto com fotos legendadas (amostra de água, análise de pH, dosagem, estoque, livro de ocorrências). Relatórios semanais e mensais são montados depois, à mão, a partir desse material.
4. Esse controle é feito por sistema (cada caldeira, torre ou tanque) ou da empresa toda junta?
   - Resposta: nos dois níveis. Dosagem, análise e observação são por sistema. O estoque físico é por cliente, porque o produto fica num único local da planta e atende todos os sistemas. Registro da visita estruturado por sistema; estoque consolidado por cliente.

### 2. Os produtos

5. Quais produtos aparecem com mais frequência? Pode dar uns exemplos com o nome que vocês usam.
   - Resposta: linha própria com prefixo QQS. Mais frequentes: QQS INP (inibidor de corrosão), QQS DIS (dispersante), QQS BIO (biocida), QQS OXP (dióxido de cloro, água potável), QQS IHP (inibidor à base de fosfato), QQS ALC (alcalinizante de caldeira), QQS NSS e QQS NSL (circuito fechado, controle por nitrito). A linha passa de vinte produtos.
6. A lista de produtos é a mesma em todas as empresas, ou cada cliente tem os seus?
   - Resposta: cada cliente tem a sua, definida pelo programa de tratamento conforme os sistemas e a água da planta. O cadastro de produtos é único e aberto; cada cliente recebe os produtos do seu programa, com dosagem e faixa de controle próprias naquele cliente.
7. Em que unidade você mede: litros, quilos, bombonas, sacos?
   - Resposta: litros. Parte dos registros sai em quilos (produto pesado em bombona), então a unidade é um campo do cadastro do produto, com litro como padrão.
8. A dosagem que você registra é do mesmo produto do estoque, ou é outra informação?
   - Resposta: é o mesmo produto, com duas informações: quanto entrou no sistema naquele dia (dosagem) e quanto restou armazenado no cliente (estoque). Pede uma terceira, vinda do cadastro: a dosagem diária teórica e a dosagem de manutenção daquele produto naquele sistema, visíveis no checklist para o técnico lançar o realizado ao lado do previsto.

### 3. Quem usa a informação

9. Depois da visita, quem olha esse estoque: você, o cliente, alguém do escritório?
   - Resposta: todos, em momentos diferentes: o técnico na visita seguinte, a diretoria e o escritório (reposição, compra de matéria-prima, faturamento) e o cliente, conforme o contrato.
10. Para que serve saber o estoque: avisar que vai acabar, levar produto na próxima visita, cobrar o cliente?
    - Resposta: depende do regime de contrato. Quando o cliente compra o produto, o checklist sinaliza que ele acaba em 30, 40 ou 60 dias para o cliente programar a compra; o aviso é para o cliente. Em contrato de serviço com produto embutido, o aviso é interno, para a QQS repor antes de acabar. O cadastro do cliente precisa registrar o regime, porque ele define o destinatário do alerta.
11. Seria útil ver como o estoque de uma empresa foi mudando visita após visita?
    - Resposta: sim, para estoque, dosagem e resultados de análise, com histórico por cliente e por sistema. Com estoque e consumo médio, o app calcula a autonomia: no ritmo atual, o produto acaba em X dias.
12. Existe uma quantidade mínima que, se ficar abaixo, alguém precisa ser avisado?
    - Resposta: sim, medida em dias de autonomia, porque o consumo varia muito entre clientes. Limite definido por cliente e produto (por exemplo, 30 dias), disparando aviso ao destinatário do regime de contrato.

### 4. Para fechar

13. Quem pode cadastrar ou mudar a lista de produtos de uma empresa: só o supervisor ou o técnico também?
    - Resposta: somente os diretores. Definir o programa de tratamento (produto, quantidade por dia, faixas de controle) exige formação técnica. O técnico executa e registra, sem alterar cadastro nem programa. Perfis mínimos: gestor (cadastra clientes, sistemas, produtos e programas e enxerga tudo) e técnico (executa o checklist dos clientes da sua programação).
14. O que te deixaria irritado se o app fizesse errado nessa parte?
    - Resposta: quatro pontos. Encerrar a visita sem estoque e dosagem registrados. Depender de internet: plantas como Samsung, Astemo, Yamaha, COPAG e Flex restringem o celular; em algumas a equipe fica sem comunicação o atendimento todo, em outras a câmera é lacrada na portaria. O app precisa funcionar totalmente offline, sincronizar na saída e tratar a foto como opcional conforme o cliente. Registro frágil: o checklist é documento de auditoria ISO 9001, com data, hora de entrada e de saída, executante e assinatura do responsável do cliente na tela, sem edição posterior sem rastro. Misturar produto de um cliente com o programa de outro.
15. Se o app pudesse fazer só uma coisa bem com o estoque, qual seria?
    - Resposta: avisar, sem ser perguntado, em quais clientes cada produto vai acabar e quando: uma lista de autonomia por cliente, cruzando o estoque registrado na visita com o consumo.

## Observações da entrevista

O entrevistado deixou claro que o produto do app é o registro completo da visita técnica, e o estoque é uma parte dele. Pontos adicionais da rotina:

- **Análises in loco** lançadas na hora, conforme o sistema: pH, cloro, nitrito, sulfito, condutividade, fosfato, zinco. Junto delas, observações do que foi encontrado de diferente (limo na torre, espuma, vazamento, torre fora de operação).
- **Estrutura de cadastro** já praticada no papel: cliente, depois sistemas (torre de resfriamento, caldeira, chiller e circuito fechado, ETE/ETDI, água potável com pontos de coleta, fancoil), depois, por sistema, parâmetros com faixa de controle e produtos com dosagem. Cada tipo de sistema tem parâmetros próprios: torre (pH, cloro, condutividade), caldeira (pH, sulfito, pressão), circuito fechado (pH, nitrito, condutividade), água potável (cloro livre ponto a ponto). O checklist de cada cliente deve ser montado a partir desse cadastro.
- **Valor fora da faixa** precisa de destaque imediato para o técnico e gerar pendência ou notificação para o gestor. Exemplo real citado: nitrito 560 numa faixa impressa de 200 a 400, sem nenhum destaque.
- Para a **programação semanal**, cada técnico recebe hoje uma planilha (cliente por manhã e tarde). Quer agenda por técnico com status realizada, pendente ou atrasada, e visão do dia para o gestor.
- **Saída em PDF** do checklist para envio ao cliente, no lugar do papel escaneado. Alguns clientes exigem relatório mensal, hoje montado à mão.
- Existe um **projeto de 2018** parecido (app do técnico e painel do gestor: login, seleção de cliente, check-in com localização, início e fim com hora, equipamentos por cliente, coleta, checklist, cupom de corrosão, microbiológico, dosagem, foto, painel com visitas do dia e atrasos). Ele ofereceu enviar os slides.
- Porte da operação: cerca de 8 técnicos de campo e 40 clientes ativos, com visitas na maioria semanais.

O texto recebido termina cortado no fim da página 5; pode haver uma última frase não transcrita.

## Impacto na RS-001

Questões em aberto que as respostas resolvem ou encaminham:

| Item | Situação após a entrevista |
|---|---|
| RA-002 (PDF) | PDF por visita, enviado ao cliente. Relatório mensal consolidado surge como necessidade nova de alguns clientes. |
| RA-003 (modelos de checklist) | Gestor cadastra sistemas, parâmetros, faixas e produtos pelo app; o checklist é derivado desse cadastro. |
| RA-004 (assinatura) | Assinatura do responsável do cliente na tela faz parte do documento auditado. Falta confirmar o que fazer quando o responsável não estiver presente. |
| RA-006 (campos e unidades) | Parâmetros por tipo de sistema e unidade por produto definidos em linhas gerais; os valores exatos dependem dos checklists impressos. |
| RA-011 (foto obrigatória) | Foto opcional, configurável por cliente (algumas plantas lacram a câmera). Estoque e dosagem passam a ser obrigatórios para encerrar. |
| RA-012 (correção de visita) | Nenhuma edição posterior sem rastro, por exigência da ISO 9001. Falta decidir entre correção direta com histórico e solicitação de ajuste ao técnico. |
| RA-014 (agendamento) | Confirmado: agenda semanal por técnico com status realizada, pendente ou atrasada. |

Conceitos novos, sem requisito correspondente na RS-001 v0.2: catálogo global de produtos com unidade; programa de tratamento por cliente e sistema (dosagem diária teórica, dosagem de manutenção, faixa de controle); regime de contrato do cliente (compra de produto ou serviço com produto embutido); limite de autonomia em dias por cliente e produto; cálculo de autonomia e lista de clientes com produto acabando; situação do sistema na visita; cupom de corrosão e coleta microbiológica com datas; destaque e notificação de valor fora da faixa; histórico por sistema; relatório mensal.

## Pendências com o entrevistado

- Pedir os slides do projeto de 2018.
- Solicitar fotos de checklists impressos preenchidos, de preferência o do nitrito 560 e um de cada tipo de sistema.
- Confirmar a frase final cortada no texto das respostas.
- Perguntar como o consumo médio deve ser calculado (diferença de estoque entre visitas descontando reposições, ou dosagem registrada) e como a reposição de produto entra no registro.
- Definir o canal do aviso de autonomia para o cliente: no PDF do checklist, por e-mail ou outro meio.
