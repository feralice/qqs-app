# Catálogo de produtos e programa de tratamento

**Data:** 20/10/2026
**Origem:** ENT-001 (respostas de 20/10/2026), subprojeto 1 de 4
**Requisitos:** RF-006, RF-009, RF-023, RF-026 da RS-001 v0.2; resolve parte de RA-003 e RA-006

## Intenção

O checklist digital de cada cliente precisa ser montado a partir de um cadastro, como o checklist impresso é hoje: cliente, sistemas, e por sistema os parâmetros com faixa de controle e os produtos com dosagem. Este subprojeto cria esse cadastro. Checklist da visita, estoque, autonomia e PDF ficam nos subprojetos seguintes e vão ler daqui.

## Objetivos

- Manter um catálogo único de produtos (linha QQS, mais de vinte itens), cada um com unidade de medida. Litro é o padrão; quilo também é aceito.
- Definir por sistema do cliente o programa de tratamento: parâmetros analíticos com faixa de controle e produtos com dosagem diária teórica e dosagem de manutenção.
- Restringir a edição a diretores (perfil `supervisor`). O técnico apenas lê o programa, porque o checklist precisa dele também offline.

## Fora do escopo

Ficam para depois: lançamento de análises e dosagens na visita, estoque, regime de contrato, limite e cálculo de autonomia, alertas, histórico, PDF. Sugestão automática de parâmetros por tipo de sistema também fica de fora: o diretor digita os parâmetros.

## O que não pode acontecer

- Um programa referenciar produto de outro cliente ou sistema de outro cliente. O programa pertence ao sistema, e o sistema pertence ao cliente; a rota valida que o sistema é daquele cliente.
- O técnico alterar programa ou catálogo.
- Excluir um produto do catálogo e com isso apagar o programa ou, no futuro, registros de visita. Produto só é inativado. Um produto inativo continua nos programas que já o usam, mas não pode entrar em programas novos.

## Modelo

**Produto:** `id`, `name` (único, sem diferenciar maiúsculas, ex.: "QQS INP"), `description` (função, opcional, ex.: "Inibidor de corrosão"), `unit` (`"L"` ou `"kg"`, padrão `"L"`), `active`.

**Parâmetro de controle do sistema:** `name` (ex.: "pH", "Nitrito"), `unit` opcional (ex.: "ppm", "µS/cm"), `min` e `max` opcionais com pelo menos um informado, e `min <= max` quando os dois existem. O nome é único dentro do sistema, sem diferenciar maiúsculas.

**Produto do programa do sistema:** `productId`, `dailyDose` (dosagem diária teórica, maior que zero, na unidade do produto por dia) e `maintenanceDose` opcional (maior que zero). O mesmo produto aparece no máximo uma vez por sistema. A ordem de cadastro é preservada, porque é a ordem que o técnico vai ver.

## API

| Método e rota | Acesso | Função |
|---|---|---|
| `GET /products` | autenticado | Lista o catálogo; inativos só para supervisor com `includeInactive=true`. |
| `POST /products` | supervisor | Cadastra produto. 409 se o nome já existir. |
| `PATCH /products/:id` | supervisor | Edita nome, descrição, unidade ou `active`. |
| `GET /clients/:id/program` | autenticado | Programa de todos os sistemas do cliente, com nome e unidade de cada produto. |
| `PUT /clients/:id/systems/:systemId/program` | supervisor | Substitui o programa inteiro de um sistema. |

A troca do programa é total (PUT) porque o diretor edita o programa de um sistema como uma folha: ajustar faixas, tirar um produto e pôr outro de uma vez. Para isso a substituição precisa ser atômica, numa transação.

## Telas (perfil supervisor)

- **Produtos:** uma tela nova, acessível pelo painel do administrador, com lista do catálogo, cadastro (nome, descrição, unidade) e botão para inativar ou reativar.
- **Programa de tratamento:** no cartão da empresa, um botão "Programa de tratamento" abre a tela do cliente. Cada sistema aparece como um bloco com duas listas editáveis: parâmetros (nome, unidade, mínimo, máximo) e produtos (escolha no catálogo ativo, dosagem diária, dosagem de manutenção). O bloco tem botão "Salvar programa". Números aceitam vírgula decimal, como no cadastro de empresa.

## Decisões do desenvolvimento

Pontos que a entrevista não definiu e foram decididos na implementação:

- A faixa de controle fica no parâmetro do sistema e não no produto. A entrevista fala em "produtos com dosagem e faixa de controle", mas os exemplos (pH 6,8 a 8,2; nitrito 200 a 400) são faixas de análise.
- As dosagens são número por dia na unidade do produto. Não existe campo separado para unidade de dose.
- Não há trilha de alteração do programa neste subprojeto. Quando a visita for registrada (subprojeto 2), ela guarda uma cópia do programa vigente, e é essa cópia que serve de evidência para a ISO 9001.
