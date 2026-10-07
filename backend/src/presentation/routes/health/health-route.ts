import { z } from "zod";

import type { ApiRouter } from "../../http/api-router.js";

export function registerHealthRoute(api: ApiRouter): void {
  api.route(
    {
      method: "get",
      path: "/health",
      tag: "Infra",
      access: "public",
      summary: "Verifica se a API está no ar.",
      responses: { 200: { description: "API disponível.", schema: z.object({ status: z.literal("ok") }) } },
    },
    (_input, response) => {
      response.json({ status: "ok" });
    },
  );
}
