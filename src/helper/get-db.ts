import type { Config } from "../config/schema";
import { Postgres } from "../pg/postgres";
import { getRuntime } from "../pg/runtime";

export function getDB(config: Config) {
  switch (config.dialect) {
    case "postgresql":
      return getRuntime().pg;
    default:
      throw new Error(`Unsupported database dialect: ${config.dialect}`);
  }
}
