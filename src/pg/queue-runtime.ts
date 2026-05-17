import { BatchQueue } from "./batch-queue";
import { Postgres } from "./postgres";

export class QueueRuntime {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly db: Postgres,
    private readonly queue: BatchQueue,
  ) {}

  startFlush(): void {
    if (this.timer) return;

    const config = this.db.getConfig();

    this.timer = setInterval(() => {
      void this.flush();
    }, config.flushInterval);
  }

  stopFlush(): void {
    if (!this.timer) return;

    clearInterval(this.timer);
    this.timer = null;
  }

  async flush(): Promise<void> {
    const config = this.db.getConfig();

    for (const [table] of this.queue.entries()) {
      const batch = this.queue.drain(table, config.maxBatchSize);

      if (batch.length === 0) continue;

      await this.db.batchInsert(table, batch);
    }
  }
}
