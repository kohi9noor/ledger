import {
  sqliteTable,
  type SQLiteColumnBuilderBase,
} from "drizzle-orm/sqlite-core";

import type { Register, TaskLevel } from "./types";

export const registry: Register[] = [];

export function registerSchema<
  TName extends string,
  L extends TaskLevel,
  S extends Record<string, SQLiteColumnBuilderBase>,
>(name: TName, level: L, schema: S) {
  const table = sqliteTable(name, schema);

  registry.push({ name, level, table });
  return table;
}
