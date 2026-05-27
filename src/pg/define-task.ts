import { type PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";
import { type TaskLevel } from "./types.ts";
import { getLogger } from "../shared/logger.ts";
import { getRuntime, type Runtime } from "./runtime.ts";
import { definePreSchema } from "./utils.ts";

export function definePgTask<
  TName extends string,
  S extends Record<string, PgColumnBuilderBase>,
  M extends string,
  R extends Runtime,
>(name: TName, level: TaskLevel, schema: S, msg?: M, _runtime?: R) {
  const runtime = _runtime || getRuntime();

  const table = runtime.pg.registerSchema(
    name,
    level,
    definePreSchema(schema, level, msg),
  );

  return {
    log(log: InferInsertModel<typeof table>) {
      const logger = getLogger(runtime.config);
      logger[level]({ log }, `schema ${name}${msg ? ` ${msg}` : ""}`);
      runtime.queue.add(table, log);
      runtime.scheduler.maybeFlush();
      runtime.scheduler.startFlush();
    },

    table,
  };
}
