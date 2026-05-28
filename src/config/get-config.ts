import jiti from "jiti";
import { configSchema } from "./schema";

let cachedConfig: ReturnType<typeof configSchema.parse> | null = null;

export function getConfig() {
  if (cachedConfig) return cachedConfig;

  const dirname = new URL(".", import.meta.url).pathname;
  const load = jiti(dirname, { interopDefault: true });

  const loaded = load(process.cwd() + "/ledger.config.ts");

  const configToParse = loaded.default ?? loaded;

  cachedConfig = configSchema.parse(configToParse);

  return cachedConfig;
}
