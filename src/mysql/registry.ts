import {
  mysqlSchema,
  mysqlTable,
  type MySqlColumnBuilderBase,
} from "drizzle-orm/mysql-core";

import type { Register, TaskLevel } from "./types";

export const registry: Register[] = [];

export function registerSchema<
  TName extends string,
  L extends TaskLevel,
  S extends Record<string, MySqlColumnBuilderBase>,
>(name: TName, level: L, schema: S) {
  const { getConfig } = require("../config/get-config");

  const config = getConfig();

  const table = config.schema
    ? mysqlSchema(config.schema).table(name, schema)
    : mysqlTable(name, schema);

  registry.push({ name, level, table });
  return table;
}
