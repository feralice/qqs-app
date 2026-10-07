# ADR 0005: trabalho offline, fila e idempotência

Status: adotada, com limites registrados abaixo. Data: 2026-10-05.

## Contexto

O técnico pode perder a conexão durante uma visita. Reenviar uma operação após timeout não deve criar outra visita nem aplicar novamente uma ação já reconhecida.

## Decisão

Manter dados e fila no aparelho com SQLite, e localStorage na versão web. Operações conservam seus identificadores nas retentativas. A criação de visita pode usar id gerado no dispositivo; início e conclusão usam `operationId`. Respostas 4xx permanentes não entram em retentativa automática indefinida.

Ações administrativas guardam resultados na tabela `processed_operations`, através do port `IdempotencyStore`. Uma repetição devolve o resultado registrado, inclusive após recriar o adaptador. A fila é retomada ao abrir a lista de visitas ou solicitar sincronização.

## Consequências e limites

O app pode continuar com os dados já baixados. Ainda precisa de conexão para autenticar e buscar dados novos. O armazenamento web usa mecanismos diferentes do aparelho e não representa uma garantia de durabilidade equivalente.

A tabela evita sobrescrever o resultado para uma mesma chave, mas `runOnce` executa a alteração e salva a chave em etapas separadas. Não há garantia transacional de execução única em falhas entre essas etapas ou requisições concorrentes. Antes de usar esse mecanismo em efeitos irreversíveis, associar ação e payload à chave e incluir execução e registro numa estratégia atômica.

A fila não resolve por si só conflitos de edição entre dispositivos. Fotos ainda não têm upload em armazenamento de objetos. O serviço de notificações não foi integrado; o conjunto em memória desse serviço não oferece idempotência durável de envio.
