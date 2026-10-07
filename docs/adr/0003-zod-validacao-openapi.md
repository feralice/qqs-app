# ADR 0003: Zod como fonte de validação e OpenAPI

Status: adotada. Data: 2026-10-05.

## Contexto

Validação de entrada e documentação mantidas separadamente tendem a divergir. Contratos TypeScript ajudam na compilação, mas não validam JSON recebido pela rede.

## Decisão

Registrar rotas com `ApiRouter.route`, exigindo política de acesso e permitindo schemas Zod de body, query e respostas. O registro aplica guards e valida entradas. `buildOpenApiDocument` usa `z.toJSONSchema` do Zod 4 para gerar OpenAPI 3.1. Swagger UI usa esse documento.

Tipos compartilhados são conferidos com `satisfies z.ZodType<T>`. Schemas nomeados viram componentes; entrada usa sufixo `Input`, saída mantém o id. Assim, defaults e campos obrigatórios não dependem da ordem de registro. Conflitos de nomes com definições diferentes falham na geração.

## Consequências

A rota concentra contrato HTTP, acesso e documentação. Schemas de resposta documentam o retorno, mas não o validam em runtime. Transformações Zod precisam de revisão porque nem toda regra pode ser representada em JSON Schema. Testes validam o documento oficial, referências e diferenças entre entrada e saída.
