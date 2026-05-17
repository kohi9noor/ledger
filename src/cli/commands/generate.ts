import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { getConfig } from "../../config/get-config.ts";
import { getDrizzleDialect } from "../../helper/get-db-dilect.ts";
import { getDBRegistry } from "../../helper/get-db-registry.ts";

interface Journal {
  version: string;
  dialect: string;
  entries: {
    idx: number;
    version: string;
    when: number;
    tag: string;
    breakpoints: boolean;
  }[];
}
export async function generate() {
  try {
    const config = getConfig();

    await import(process.cwd() + config.schemaFile);

    const registry = getDBRegistry(config);

    if (registry.length <= 0) {
      console.error("No tasks found in registery");
      process.exit(1);
    }
    const db = getDrizzleDialect(config);

    const schema = Object.fromEntries(
      registry.map((task) => [task.name, task.table]),
    );

    let journal: Journal = {
      version: "7",
      dialect: "postgresql",
      entries: [],
    };

    try {
      const raw = readFileSync(
        "./ledger/migrations/meta/_journal.json",
        "utf-8",
      );
      journal = JSON.parse(raw);
    } catch (error) {
      journal = { version: "7", dialect: db, entries: [] };
    }

    const idx = journal.entries.length;

    const tag = `${String(idx).padStart(4, "0")}_migration`;

    const previousSnapshot =
      idx > 0
        ? JSON.parse(
            readFileSync(
              `./ledger/migrations/meta/${String(idx - 1).padStart(4, "0")}_snapshot.json`,
              "utf-8",
            ),
          )
        : {
            version: "7",
            dialect: db,
            tables: {},
            enums: {},
            schemas: {},
            _meta: {
              tables: {},
              columns: {},
              schemas: {},
            },
            id: "00000000-0000-0000-0000-000000000000",
            prevId: "",
          };
    const currentSnapshot = generateDrizzleJson(
      schema,
      undefined,
      config.schema ? [config.schema] : undefined,
    );
    currentSnapshot.prevId = previousSnapshot.id;
    const statements = await generateMigration(
      previousSnapshot,
      currentSnapshot,
    );

    if (statements.length === 0) {
      console.log("No changes detected, skipping migration generation.");
      return;
    }

    mkdirSync("./ledger/migrations/meta", { recursive: true });

    writeFileSync(`./ledger/migrations/${tag}.sql`, statements.join("\n"));

    writeFileSync(
      `./ledger/migrations/meta/${String(idx).padStart(4, "0")}_snapshot.json`,
      JSON.stringify(currentSnapshot, null, 2),
    );

    journal.entries.push({
      idx,
      version: "7",
      when: Date.now(),
      tag,
      breakpoints: true,
    });

    writeFileSync(
      "./ledger/migrations/meta/_journal.json",
      JSON.stringify(journal, null, 2),
    );

    console.log(`Migration generated: ${tag}.sql`);
  } catch (error) {
    throw error;
  }
}

generate();
