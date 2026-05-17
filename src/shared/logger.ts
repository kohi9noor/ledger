import pino from "pino";
import type { Config } from "../config/schema";

let logger: pino.Logger | null = null;
let lastConfig: Config | null = null;

export function getLogger(config: Config): pino.Logger {
  if (lastConfig !== config) {
    logger = pino({
      ...(config.logger || {}),
    });
    lastConfig = config;
  }
  if (!logger) {
    throw new Error("Logger failed to initialize");
  }
  return logger;
}
