import { text, timestamp } from "drizzle-orm/pg-core";
import { logLevelsEnum } from "./types";
import type { PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { TaskLevel } from "./types";

export function definePreSchema<
  T extends Record<string, PgColumnBuilderBase>,
  level extends TaskLevel,
>(schema: T, level: level, msg?: string) {
  Object.defineProperty(schema, "_log_level", {
    value: logLevelsEnum(level).default(level),
    enumerable: true,
    writable: false,
  });

  msg &&
    Object.defineProperty(schema, "_log_msg", {
      value: text().default(msg),
      enumerable: true,
      writable: false,
    });

  Object.defineProperty(schema, "_log_timestamp", {
    value: timestamp().defaultNow(),
    enumerable: true,
    writable: false,
  });

  Object.freeze(schema);

  return schema;
}
