import type { Config } from "../config/schema";
import { getRuntime } from "../pg/runtime";

export function getDBRegistry(config: Config) {
  switch (config.dialect) {
    case "postgresql":
      return getRuntime().pg.register;
    default:
      throw new Error(`Unsupported database dialect: ${config.dialect}`);
  }
}
