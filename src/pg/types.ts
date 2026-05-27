import type pino from "pino";
import "../index.ts";
import { pgEnum, type AnyPgTable } from "drizzle-orm/pg-core";

export type Register = {
  name: string;
  level: TaskLevel;
  table: AnyPgTable;
};
export type TaskLevel = pino.Level;

const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

export const logLevelsEnum = pgEnum("log_levels", logLevels);
