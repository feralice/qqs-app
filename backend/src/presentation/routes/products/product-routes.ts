import type { ApiRouter } from "../../http/api-router.js";
import { ErrorSchema, errorResponses } from "../../http/schemas.js";
import { createProduct, updateProduct } from "../../../application/products/commands/product-commands.js";
import { replaceSystemProgram } from "../../../application/products/commands/replace-system-program.js";
import { getClientProgram } from "../../../application/products/queries/get-client-program.js";
import { listProducts } from "../../../application/products/queries/list-products.js";
import type { ClientRepository } from "../../../application/clients/ports.js";
import type { ProductRepository, ProgramRepository } from "../../../application/products/ports.js";
import {
  ClientProgramSchema,
  CreateProductBody,
  ListProductsQuery,
  ProductListSchema,
  ProductSchema,
  SystemProgramSchema,
  UpdateProductBody,
  UpdateSystemProgramBody,
} from "./product-schemas.js";

export type ProductRouteDependencies = {
  clients: ClientRepository;
  products: ProductRepository;
  programs: ProgramRepository;
};

const productResponse = { description: "Produto.", schema: ProductSchema };

export function registerProductRoutes(api: ApiRouter, deps: ProductRouteDependencies): void {
  api.route(
    {
      method: "get",
      path: "/products",
      tag: "Produtos",
      access: "authenticated",
      summary: "Catálogo de produtos químicos.",
      query: ListProductsQuery,
      responses: { 200: { description: "Produtos.", schema: ProductListSchema } },
    },
    async ({ query, auth }, response) => {
      response.json({ items: await listProducts(deps.products, auth, query) });
    },
  );

  api.route(
    {
      method: "post",
      path: "/products",
      tag: "Produtos",
      access: "supervisor",
      summary: "Cadastra um produto no catálogo.",
      body: CreateProductBody,
      responses: {
        201: productResponse,
        400: errorResponses.validation,
        403: errorResponses.forbidden,
        409: { description: "Nome já cadastrado.", schema: ErrorSchema },
      },
    },
    async ({ body }, response) => {
      response.status(201).json(await createProduct(deps.products, body));
    },
  );

  api.route(
    {
      method: "patch",
      path: "/products/:id",
      tag: "Produtos",
      access: "supervisor",
      summary: "Edita, inativa ou reativa um produto.",
      body: UpdateProductBody,
      responses: {
        200: productResponse,
        400: errorResponses.validation,
        403: errorResponses.forbidden,
        404: errorResponses.notFound,
        409: errorResponses.conflict,
      },
    },
    async ({ params, body }, response) => {
      response.json(await updateProduct(deps.products, params.id, body));
    },
  );

  api.route(
    {
      method: "get",
      path: "/clients/:id/program",
      tag: "Programa de tratamento",
      access: "authenticated",
      summary: "Programa de tratamento de cada sistema da empresa.",
      responses: { 200: { description: "Programa.", schema: ClientProgramSchema }, 404: errorResponses.notFound },
    },
    async ({ params }, response) => {
      response.json(await getClientProgram(deps, params.id));
    },
  );

  api.route(
    {
      method: "put",
      path: "/clients/:id/systems/:systemId/program",
      tag: "Programa de tratamento",
      access: "supervisor",
      summary: "Substitui o programa de um sistema: parâmetros com faixa e produtos com dosagem.",
      body: UpdateSystemProgramBody,
      responses: {
        200: { description: "Programa salvo.", schema: SystemProgramSchema },
        400: errorResponses.validation,
        403: errorResponses.forbidden,
        404: errorResponses.notFound,
        409: { description: "Parâmetro ou produto repetido no sistema.", schema: ErrorSchema },
        422: { description: "Produto inexistente ou inativo.", schema: ErrorSchema },
      },
    },
    async ({ params, body }, response) => {
      response.json(await replaceSystemProgram(deps, params.id, params.systemId, body));
    },
  );
}
