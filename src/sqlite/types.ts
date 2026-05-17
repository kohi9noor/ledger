import type pino from "pino";
import "../index.ts";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";

export type Register = {
  name: string;
  level: TaskLevel;
  table: AnySQLiteTable;
};

export type TaskLevel = pino.Level;
