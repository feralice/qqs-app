# ADR 0001: monólito modular com Clean Architecture

Status: adotada. Data: 2026-10-05.

## Contexto

O app reúne autenticação, empresas, visitas e administração. Regras precisam ser testáveis sem Express ou banco, e os adaptadores podem mudar sem reescrever casos de uso. Serviços separados aumentariam a operação antes de existir necessidade concreta.

## Decisão

Manter uma API em um único processo, organizada em `domain`, `application`, `infrastructure` e `presentation`, com áreas de negócio dentro das camadas. Separar comandos de consultas na aplicação, usando o mesmo banco. Não há event sourcing nem bancos distintos de leitura e escrita.

Os ports definem o que cada caso de uso precisa. Drizzle, JWT, CSV e relógio implementam essas interfaces. `presentation/app.ts` compõe as dependências e `architecture.test.ts` confere a direção de imports estáticos.

## Consequências

O núcleo fica testável com repositórios em memória e os detalhes externos ficam concentrados. A organização exige disciplina para não colocar regras nas rotas. O teste de imports não garante sozinho todos os limites arquiteturais, especialmente imports dinâmicos e efeitos colaterais; a revisão continua necessária.
