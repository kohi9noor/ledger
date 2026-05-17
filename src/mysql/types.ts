import type pino from "pino";
import "../index.ts";
import type { AnyMySqlTable } from "drizzle-orm/mysql-core";

export type Register = {
  name: string;
  level: TaskLevel;
  table: AnyMySqlTable;
};

export type TaskLevel = pino.Level;
