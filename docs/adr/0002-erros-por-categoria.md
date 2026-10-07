# ADR 0002: erros por categoria

Status: adotada. Data: 2026-10-05.

## Contexto

Mapear mensagens de erro para HTTP em cada rota duplicava lógica e tornava a API dependente do texto da exceção. Bibliotecas como `http-errors` e `boom` representam diretamente status HTTP, um detalhe de apresentação.

## Decisão

Usar `AppError` e categorias de domínio: `validation`, `unauthorized`, `forbidden`, `not_found`, `conflict`, `unprocessable` e `rate_limited`. Exceções específicas herdam da categoria adequada. `presentation/http/error-handler.ts` faz a única tradução para HTTP e retorna `{ error, details? }`.

Erros inesperados ficam no logger e retornam uma mensagem genérica com status 500. JSON malformado recebe 400. Mensagens existentes foram preservadas para compatibilidade com clientes e testes.

## Consequências

O domínio não importa Express nem códigos HTTP. Novas categorias exigem revisar o mapeamento central. O formato de detalhes de validação pertence à apresentação; clientes não devem depender de stack traces ou mensagens internas.
