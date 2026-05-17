import type { Config } from "../config/schema";
import { Postgres } from "../pg/postgres";

export function getDrizzleDialect(config: Config) {
  switch (config.dialect) {
    case "postgresql":
      return Postgres.drizzleDialect;
    default:
      throw new Error(`Unsupported database dialect: ${config.dialect}`);
  }
}
