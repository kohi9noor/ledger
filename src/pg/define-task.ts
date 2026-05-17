import type { PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";
import { type TaskLevel } from "./types.ts";
import { getLogger } from "../shared/logger.ts";
import { getRuntime } from "./runtime.ts";

const runtime = getRuntime();

export function definePgTask<
  TName extends string,
  S extends Record<string, PgColumnBuilderBase>,
  M extends string,
>(name: TName, level: TaskLevel, schema: S, msg?: M) {
  const table = runtime.pg.registerSchema(name, level, schema);
  return {
    log(log: InferInsertModel<typeof table>) {
      const logger = getLogger(runtime.config);

      logger[level]({ log }, `schema ${name}${msg ? ` ${msg}` : ""}`);

      const shouldFlush = runtime.queue.add(table, log);

      if (shouldFlush) {
        runtime.scheduler.flush();
      }

      runtime.scheduler.startFlush();
    },

    table,
  };
}
