import { type PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";
import { type TaskLevel } from "./types.ts";
import { getLogger } from "../shared/logger.ts";
import { getRuntime, type Runtime } from "./runtime.ts";
import { definePreSchema, enrich } from "./utils.ts";

export function definePgTask<
  TName extends string,
  S extends Record<string, PgColumnBuilderBase>,
  M extends string,
  R extends Runtime,
>(name: TName, level: TaskLevel, schema: S, msg?: M, _runtime?: R) {
  const runtime = _runtime || getRuntime();

  /**
   * Note this definePreSchema constraint only gets default
   * value when the table gets inserted in database,
   * this is important to note;
   * definePreSchema is used to add logging at the database level,
   * so we don't actually add value at the runtime level,
   * but in enrich function we are generating the value at runtime level,
   * and that's important to note, because default uuid at the database level will be diff in each insert,
   * but at runtime level we can generate the uuid and use it and keeps the same uuid for the same log, and that's important for tracing the logs in the database,
   */
  const table = runtime.pg.registerSchema(
    name,
    level,
    definePreSchema(schema, level, msg),
  );

  return {
    log(log: InferInsertModel<typeof table> & { _log_id?: string }) {
      const enriched = enrich(table)(log);
      const logger = getLogger(runtime.config);
      logger[level]({ log }, `schema ${name}${msg ? ` ${msg}` : ""}`);
      runtime.queue.add(table, enriched);
      runtime.scheduler.maybeFlush();
      runtime.scheduler.startFlush();
    },

    table,
  };
}
