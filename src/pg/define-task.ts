import { text, timestamp, type PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";
import { logLevelsEnum, type TaskLevel } from "./types.ts";
import { getLogger } from "../shared/logger.ts";
import { getRuntime } from "./runtime.ts";

const runtime = getRuntime();

function definePreSchema<
  T extends Record<string, PgColumnBuilderBase>,
  level extends TaskLevel,
>(schema: T, level: level, msg?: string) {
  Object.defineProperty(schema, "_log_level", {
    value: logLevelsEnum(level).default(level),
  });

  msg &&
    Object.defineProperty(schema, "_log_msg", {
      value: text().default(msg),
    });

  Object.defineProperty(schema, "_log_timestamp", {
    value: timestamp().defaultNow(),
  });

  return schema;
}

export function definePgTask<
  TName extends string,
  S extends Record<string, PgColumnBuilderBase>,
  M extends string,
>(name: TName, level: TaskLevel, schema: S, msg?: M) {
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

process.on("SIGTERM", () => {
  runtime.scheduler.flush().then(() => {
    console.log("Flushed remaining logs. Exiting.");
    process.exit(0);
  });
  runtime.scheduler.stopFlush();
});

process.on("SIGINT", () => {
  runtime.scheduler.flush().then(() => {
    console.log("Flushed remaining logs. Exiting.");
    process.exit(0);
  });
  runtime.scheduler.stopFlush();
});
