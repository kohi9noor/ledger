import type { InferInsertModel } from "drizzle-orm";
import { registerSchema } from "./registry.ts";
import type { TaskLevel } from "./types.ts";
import { getLogger } from "../runtime/logger.ts";
import { addToQueue, startFlush } from "../runtime/queue.ts";
import type { MySqlColumnBuilderBase } from "drizzle-orm/mysql-core";
export function defineTask<
  TName extends string,
  S extends Record<string, MySqlColumnBuilderBase>,
  M extends string,
>(name: TName, level: TaskLevel, schema: S, msg?: M) {
  const table = registerSchema(name, level, schema);

  return {
    log(log: InferInsertModel<typeof table>) {
      const logger = getLogger();
      logger[level]({ log }, `schema ${name}${msg ? ` ${msg}` : ""}`);
      startFlush();
      addToQueue(table, log);
    },
    table,
  };
}
