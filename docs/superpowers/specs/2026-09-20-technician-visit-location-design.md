# Primeiro fluxo do técnico — visitas e localização na chegada

**Status:** Aguardando revisão do solicitante  
**Data:** 20/09/2026

## Objetivo

Entregar o primeiro incremento vertical do QQS App para o técnico em campo: consultar visitas atribuídas, abrir os detalhes de uma visita e registrar a chegada com data, hora e localização capturada no dispositivo.

## Escopo

### Incluído

- Tela de lista de visitas atribuídas ao técnico.
- Tela de detalhes da visita, cliente e sistemas/equipamentos.
- Ação “Registrar chegada”.
- Solicitação de permissão de localização no momento da ação.
- Captura única de latitude, longitude e horário da chegada.
- Salvamento local da operação quando o dispositivo estiver offline.
- Enfileiramento da operação para sincronização posterior.
- Endpoints REST para listar, consultar, criar uma visita de desenvolvimento e iniciar uma visita.
- Abertura do ponto capturado no Google Maps por link externo.

### Fora deste incremento

- Rastreamento contínuo do técnico.
- Checklist detalhado.
- Participantes da visita.
- Encerramento, assinatura e PDF.
- Autenticação real e autorização por perfil.
- Geocodificação obrigatória de coordenadas em endereço.
- Banco PostgreSQL; o primeiro slice pode usar repositório em memória para validar o fluxo.

## Fluxo do técnico

1. O técnico abre a tela “Visitas”.
2. O app exibe as visitas atribuídas e seus estados.
3. O técnico abre uma visita.
4. O app exibe cliente, sistemas e estado atual.
5. O técnico toca em “Registrar chegada”.
6. O app solicita permissão de localização, caso ainda não exista.
7. Com permissão, o app captura a localização atual uma única vez.
8. O app registra o horário da chegada e salva a operação localmente.
9. Se houver conexão, a operação é enviada ao backend; caso contrário, fica pendente na fila.
10. O app mostra a visita como “Em andamento”.
11. Quando houver coordenadas, o técnico pode abrir o ponto no Google Maps.

Se a permissão for negada ou a localização não puder ser obtida, a chegada ainda poderá ser registrada sem localização, com aviso explícito ao técnico.

## Telas

### Visitas

Responsabilidade: apresentar as visitas do técnico e o estado de sincronização.

Estados mínimos:

- `assigned`: atribuída, ainda não iniciada.
- `in_progress`: chegada registrada.
- `pending_sync`: operação local aguardando envio.
- `sync_failed`: última tentativa falhou.

Cada item deve mostrar cliente, data prevista, quantidade de sistemas e estado.

### Detalhes da visita

Responsabilidade: mostrar o contexto da visita e oferecer a ação de chegada.

Conteúdo mínimo:

- nome do cliente;
- endereço cadastrado, quando disponível;
- sistemas/equipamentos da visita;
- horário de chegada, quando registrado;
- estado de sincronização;
- botão “Registrar chegada” enquanto a visita estiver `assigned`;
- botão “Abrir localização no Google Maps” quando houver coordenadas.

### Componentes de localização

A captura de localização deve ficar atrás de um adaptador próprio, separado da tela. A tela conhece apenas o resultado `granted`, `denied` ou `unavailable` e os dados de coordenada; não deve depender diretamente da API nativa.

## API

### `GET /visits`

Retorna as visitas do técnico autenticado. Nesta primeira versão, o identificador do técnico pode ser um valor de desenvolvimento definido pelo adaptador de autenticação.

Resposta de exemplo:

```json
{
  "items": [
    {
      "id": "visit-001",
      "clientId": "client-001",
      "clientName": "Gases da Amazônia",
      "scheduledFor": "2026-09-21T13:00:00.000Z",
      "status": "assigned",
      "systemsCount": 3
    }
  ]
}
```

### `GET /visits/:id`

Retorna os detalhes da visita, incluindo cliente, sistemas, status e localização de chegada quando existente.

### `POST /visits`

Cria uma visita de desenvolvimento para permitir demonstração e testes do fluxo até a autenticação e persistência real serem implementadas.

### `POST /visits/:id/start`

Registra a chegada de forma idempotente.

Requisição:

```json
{
  "arrivedAt": "2026-09-21T13:15:00.000Z",
  "location": {
    "latitude": -3.1190275,
    "longitude": -60.0217314,
    "accuracy": 12.5
  }
}
```

`location` é opcional quando a permissão foi negada ou o dispositivo não conseguiu obter a posição. Uma segunda chamada para uma visita já iniciada não deve criar uma nova chegada nem duplicar a operação.

Respostas mínimas:

- `200` com a visita atualizada quando a operação for aceita;
- `404` quando a visita não existir;
- `409` quando a visita estiver em estado incompatível para início;
- `400` quando o corpo possuir coordenadas ou data inválidas.

## Integração com localização e Google Maps

- O dispositivo será acessado por `expo-location`.
- A permissão será solicitada somente durante “Registrar chegada”.
- Apenas uma leitura será feita por chegada; não haverá watcher nem rastreamento contínuo.
- A localização será persistida como latitude, longitude e, quando disponível, precisão.
- O Google Maps será aberto por URL externa usando as coordenadas capturadas. Não haverá dependência inicial de chave de API nem geocodificação obrigatória.
- A localização seguirá funcionando offline; abrir o mapa dependerá de conectividade e do aplicativo de mapas disponível no dispositivo.

## Offline e sincronização

A ação de iniciar visita primeiro atualiza o estado local e cria uma operação idempotente na fila. A chamada remota é uma consequência da sincronização, não um pré-requisito para o técnico continuar.

A operação deve possuir um identificador estável e ser reenviada sem duplicar a chegada. A interface deve distinguir “salvo no dispositivo” de “sincronizado com o servidor”.

## Validação e erros

- Latitude deve estar entre `-90` e `90`.
- Longitude deve estar entre `-180` e `180`.
- `arrivedAt` deve ser uma data ISO válida.
- Permissão negada não é erro bloqueante para registrar a chegada.
- Falha de rede deve gerar estado pendente ou falho, nunca apagar a visita local.
- Visita inexistente deve produzir erro recuperável na tela.

## Critérios de aceitação

- O técnico consegue ver a lista de visitas.
- O técnico consegue abrir os detalhes de uma visita.
- Ao registrar chegada, o app solicita localização apenas quando necessário.
- Com permissão concedida, latitude, longitude, precisão e horário são salvos.
- Com permissão negada, a visita ainda pode ser iniciada e o motivo é informado.
- Sem rede, a chegada permanece disponível localmente e entra na fila.
- Com rede, a operação é enviada uma única vez mesmo após retentativas.
- O backend rejeita coordenadas inválidas.
- O técnico consegue abrir o ponto capturado no Google Maps.
- O backend pode ser substituído por persistência real sem mudar a interface das telas.

## Decisões posteriores

- Autenticação real e identificação do técnico.
- Persistência PostgreSQL/Drizzle.
- Modelo definitivo de atribuição.
- Campos dos checklists.
- Política para visitas iniciadas em dois dispositivos.
