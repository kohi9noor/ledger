import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { logLevelsEnum } from "./types";
import type { AnyPgTable, PgColumnBuilderBase } from "drizzle-orm/pg-core";
import type { TaskLevel } from "./types";
import type { InferInsertModel } from "drizzle-orm";

export function definePreSchema<
  T extends Record<string, PgColumnBuilderBase>,
  level extends TaskLevel,
>(
  schema: T,
  level: level,
  msg?: string,
): T & {
  _log_id: ReturnType<typeof uuid>;
  _log_level: ReturnType<typeof logLevelsEnum>;
  _log_msg?: ReturnType<typeof text>;
  _log_timestamp: ReturnType<typeof timestamp>;
} {
  Object.defineProperty(schema, "_log_id", {
    value: uuid().unique().defaultRandom(),
    enumerable: true,
    writable: false,
  });

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

  return schema as T & {
    _log_id: ReturnType<typeof uuid>;
    _log_level: ReturnType<typeof logLevelsEnum>;
    _log_msg?: ReturnType<typeof text>;
    _log_timestamp: ReturnType<typeof timestamp>;
  };
}

export function enrich(table: AnyPgTable) {
  return function enrichLog<T extends InferInsertModel<typeof table>>(
    log: T & { _log_id?: string },
  ) {
    return {
      ...log,
      _log_id:
        "_log_id" in log && log._log_id ? log._log_id : crypto.randomUUID(),
    };
  };
}
