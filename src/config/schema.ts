import { z } from "zod";
import pino from "pino";

export const configSchema = z.object({
  connection: z.string({ error: "Connection String is needed" }),
  schemaFile: z.string({ error: " Schema file path should be provided" }),
  dialect: z
    .enum(["postgresql", "mysql", "sqlite"], { error: "" })
    .default("postgresql"),
  schema: z.string().optional(),
  logger: z.custom<pino.LoggerOptions>().optional(),
  maxBatchSize: z.number().optional().default(500),
  flushInterval: z.number().optional().default(2000),
  maxConcurrentBatches: z.number().optional().default(5),
});

export type Config = z.infer<typeof configSchema>;
export type ConfigInput = z.input<typeof configSchema>;
