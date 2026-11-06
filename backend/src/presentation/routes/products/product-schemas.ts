import { z } from "zod";
import type {
  ClientProgram,
  ControlParameter,
  CreateProductRequest,
  Product,
  ProgramProductInput,
  SystemProgram,
  UpdateProductRequest,
  UpdateSystemProgramRequest,
} from "@qqs/contracts";

const ProductUnitSchema = z.enum(["L", "kg"]).describe("Unidade de medida; litro é o padrão.");

export const CreateProductBody = z
  .object({
    name: z.string().describe('Nome comercial, ex.: "QQS INP".'),
    description: z.string().optional().describe("Função do produto."),
    unit: ProductUnitSchema.optional(),
  })
  .meta({ id: "CreateProductInput" }) satisfies z.ZodType<CreateProductRequest>;

export const UpdateProductBody = CreateProductBody.partial().extend({
  active: z.boolean().optional(),
}) satisfies z.ZodType<UpdateProductRequest>;

export const ListProductsQuery = z.object({
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
    .describe("Só tem efeito para supervisor."),
});

export const ProductSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    unit: ProductUnitSchema,
    active: z.boolean(),
  })
  .meta({ id: "Product" }) satisfies z.ZodType<Product>;

export const ProductListSchema = z.object({ items: z.array(ProductSchema) });

const ControlParameterSchema = z
  .object({
    name: z.string().describe('Parâmetro analítico, ex.: "pH", "Nitrito".'),
    unit: z.string().optional().describe('Ex.: "ppm", "µS/cm".'),
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .meta({ id: "ControlParameter", description: "Faixa de controle; ao menos um dos limites." }) satisfies z.ZodType<ControlParameter>;

const ProgramProductInputSchema = z.object({
  productId: z.string(),
  dailyDose: z.number().describe("Dosagem diária teórica, na unidade do produto."),
  maintenanceDose: z.number().optional().describe("Dosagem de manutenção, na unidade do produto."),
}) satisfies z.ZodType<ProgramProductInput>;

export const UpdateSystemProgramBody = z
  .object({
    parameters: z.array(ControlParameterSchema),
    products: z.array(ProgramProductInputSchema),
  })
  .meta({ id: "SystemProgramInput" }) satisfies z.ZodType<UpdateSystemProgramRequest>;

export const SystemProgramSchema = z
  .object({
    systemId: z.string(),
    systemName: z.string(),
    systemType: z.string(),
    parameters: z.array(ControlParameterSchema),
    products: z.array(
      ProgramProductInputSchema.extend({
        productName: z.string(),
        unit: ProductUnitSchema,
        productActive: z.boolean(),
      }),
    ),
  })
  .meta({ id: "SystemProgram" }) satisfies z.ZodType<SystemProgram>;

export const ClientProgramSchema = z
  .object({ clientId: z.string(), systems: z.array(SystemProgramSchema) })
  .meta({ id: "ClientProgram" }) satisfies z.ZodType<ClientProgram>;
