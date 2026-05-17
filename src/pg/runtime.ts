import { Postgres } from "./postgres";
import { BatchQueue } from "./batch-queue";
import { QueueRuntime } from "./queue-runtime";
import type { Config } from "../config/schema";

let _runtime: ReturnType<typeof createPgTaskRuntime> | null = null;

export function getRuntime() {
  if (_runtime) return _runtime;
  const { getConfig } = require("../config/get-config");
  _runtime = createPgTaskRuntime(getConfig());
  return _runtime;
}

function createPgTaskRuntime(config: Config) {
  const pg = new Postgres(config);
  const queue = new BatchQueue();
  const runtime = new QueueRuntime(pg, queue);
  return { pg, queue, scheduler: runtime, config };
}
