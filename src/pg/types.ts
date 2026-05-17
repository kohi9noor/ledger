import type pino from "pino";
import "../index.ts";
import type { AnyPgTable } from "drizzle-orm/pg-core";
export type Register = {
  name: string;
  level: TaskLevel;
  table: AnyPgTable;
};
export type TaskLevel = pino.Level;
