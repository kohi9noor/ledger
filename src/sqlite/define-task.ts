import type { InferInsertModel } from "drizzle-orm";
import type { TaskLevel } from "../core/types.ts";
import { getLogger } from "../runtime/logger.ts";
import { addToQueue, startFlush } from "../runtime/queue.ts";
import { registerSchema } from "./registry.ts";
import type { SQLiteColumnBuilderBase } from "drizzle-orm/sqlite-core";
import { setDB } from "../runtime/db.ts";

export function defineSqliteTask<
  TName extends string,
  S extends Record<string, SQLiteColumnBuilderBase>,
  M extends string,
>(name: TName, level: TaskLevel, schema: S, msg?: M) {
  const table = registerSchema(name, level, schema);

  return {
    log(log: InferInsertModel<typeof table>) {
      const logger = getLogger();
      logger[level]({ log }, `schema ${name}${msg ? ` ${msg}` : ""}`);
      setDB();
      startFlush();
      addToQueue(table, log);
    },
    table,
  };
}
