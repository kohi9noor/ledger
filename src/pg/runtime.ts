import { Postgres } from "./postgres";
import { BatchQueue } from "./batch-queue";
import { QueueRuntime } from "./queue-runtime";
import type { Config } from "../config/schema";

let _runtime: ReturnType<typeof createPgRuntime> | null = null;

export function getRuntime() {
  if (_runtime) return _runtime;

  const { getConfig } = require("../config/get-config");

  _runtime = createPgRuntime(getConfig());
  attachProcessExitHandler(_runtime);
  return _runtime;
}

export function createPgRuntime<T extends Config>(config: T) {
  const pg = new Postgres(config);
  const queue = new BatchQueue();
  const runtime = new QueueRuntime(pg, queue);
  return { pg, queue, scheduler: runtime, config };
}

function attachProcessExitHandler(runtime: Runtime) {
  const handleExit = async () => {
    await runtime.scheduler.flush();
    process.exit();
  };

  process.on("beforeExit", handleExit);
  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
}
export type Runtime = ReturnType<typeof createPgRuntime>;
