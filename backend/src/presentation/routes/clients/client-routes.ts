import type { ApiRouter } from "../../http/api-router.js";
import { errorResponses } from "../../http/schemas.js";
import { addClientSystem } from "../../../application/clients/commands/add-client-system.js";
import { createClient } from "../../../application/clients/commands/create-client.js";
import { updateClient } from "../../../application/clients/commands/update-client.js";
import { getClient, listClients } from "../../../application/clients/queries/client-queries.js";
import type { ClientRepository } from "../../../application/clients/ports.js";
import {
  ClientListSchema,
  ClientSummarySchema,
  ClientSystemBody,
  CreateClientBody,
  ListClientsQuery,
  UpdateClientBody,
} from "./client-schemas.js";

const tag = "Empresas";
const clientResponse = { description: "Empresa.", schema: ClientSummarySchema };

export function registerClientRoutes(api: ApiRouter, repository: ClientRepository): void {
  api.route(
    {
      method: "get",
      path: "/clients",
      tag,
      access: "authenticated",
      summary: "Lista empresas ativas, com busca (RF-012).",
      query: ListClientsQuery,
      responses: { 200: { description: "Empresas.", schema: ClientListSchema } },
    },
    async ({ query, auth }, response) => {
      response.json({ items: await listClients(repository, auth, query) });
    },
  );

  api.route(
    {
      method: "get",
      path: "/clients/:id",
      tag,
      access: "authenticated",
      summary: "Detalhe de uma empresa com seus sistemas.",
      responses: { 200: clientResponse, 404: errorResponses.notFound },
    },
    async ({ params }, response) => {
      response.json(await getClient(repository, params.id));
    },
  );

  api.route(
    {
      method: "post",
      path: "/clients",
      tag,
      access: "supervisor",
      summary: "Cadastra empresa com sistemas (RF-005 a RF-008).",
      body: CreateClientBody,
      responses: {
        201: clientResponse,
        400: errorResponses.validation,
        403: errorResponses.forbidden,
        409: { description: "CNPJ já cadastrado ou sistema repetido.", schema: errorResponses.conflict.schema },
      },
    },
    async ({ body }, response) => {
      response.status(201).json(await createClient(repository, body));
    },
  );

  api.route(
    {
      method: "patch",
      path: "/clients/:id",
      tag,
      access: "supervisor",
      summary: "Edita, ativa ou inativa uma empresa.",
      body: UpdateClientBody,
      responses: {
        200: clientResponse,
        400: errorResponses.validation,
        403: errorResponses.forbidden,
        404: errorResponses.notFound,
        409: errorResponses.conflict,
      },
    },
    async ({ params, body }, response) => {
      response.json(await updateClient(repository, params.id, body));
    },
  );

  api.route(
    {
      method: "post",
      path: "/clients/:id/systems",
      tag,
      access: "supervisor",
      summary: "Adiciona um sistema/equipamento à empresa.",
      body: ClientSystemBody,
      responses: {
        201: clientResponse,
        400: errorResponses.validation,
        403: errorResponses.forbidden,
        404: errorResponses.notFound,
        409: errorResponses.conflict,
      },
    },
    async ({ params, body }, response) => {
      response.status(201).json(await addClientSystem(repository, params.id, body));
    },
  );
}
