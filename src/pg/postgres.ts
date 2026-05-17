import { pgSchema, pgTable } from "drizzle-orm/pg-core";
import type { Register, TaskLevel } from "./types";
import type {
  AnyPgTable,
  PgColumnBuilderBase,
  PgTableWithColumns,
  TableConfig,
} from "drizzle-orm/pg-core";
import type { Config } from "../config/schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { InferInsertModel } from "drizzle-orm";

export class Postgres {
  readonly register: Register[] = [];

  static readonly drizzleDialect = "postgresql" as const;

  private _config: Config;

  protected _db: NodePgDatabase<Record<string, never>> | null = null;

  constructor(config: Config) {
    this._config = config;
  }

  async setupDb(): Promise<NodePgDatabase<Record<string, never>>> {
    if (this._db) {
      return this._db;
    }

    const { Pool } = require("pg");
    const { drizzle } = require("drizzle-orm/node-postgres");

    const pool = new Pool({
      connectionString: this._config.connection,
    });

    const db = drizzle(pool);
    this._db = db;

    return db;
  }

  async getDb(): Promise<NodePgDatabase<Record<string, never>>> {
    if (!this._db) {
      await this.setupDb();
    }
    return this._db!;
  }
  registerSchema<
    TName extends string,
    L extends TaskLevel,
    S extends Record<string, PgColumnBuilderBase>,
  >(name: TName, level: L, schema: S): PgTableWithColumns<TableConfig> {
    const table = this._config.schema
      ? pgSchema(this._config.schema).table(name, schema)
      : pgTable(name, schema);

    this.register.push({ name, level, table });
    return table;
  }

  getConfig() {
    return this._config;
  }

  getRegister() {
    return this.register;
  }

  async migrate() {
    const db = await this.getDb();
    const { migrate } = require("drizzle-orm/node-postgres/migrator");
    return migrate(db, { migrationsFolder: "./ledger/migrations" });
  }

  async batchInsert<T extends AnyPgTable>(
    table: T,
    data: InferInsertModel<T>[],
  ) {
    const db = await this.getDb();
    return db.insert(table).values(data);
  }
}
