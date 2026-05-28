import { BatchQueue } from "./batch-queue";
import { Postgres } from "./postgres";

export class QueueRuntime {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly db: Postgres,
    private readonly queue: BatchQueue,
  ) {}

  private isFlushing = false;

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

  async maybeFlush() {
    const config = this.db.getConfig();
    if (this.queue.size() >= config.maxBatchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing) return;

    this.isFlushing = true;

    try {
      if (!this.db.connected) {
        console.error("Database is not connected.");
        return;
      }

      const tasks = [];

      const config = this.db.getConfig();

      for (const [table] of this.queue.entries()) {
        const batch = this.queue.peek(table, config.maxBatchSize);
        if (batch.length === 0) continue;
        tasks.push(
          (async () => {
            try {
              await this.db.batchInsert(table, batch);
              this.queue.commit(table, batch.length);
            } catch (error) {
              console.error(error);
            }
          })(),
        );

        if (tasks.length >= config.maxConcurrentBatches) {
          await Promise.allSettled(tasks);
          tasks.length = 0;
        }
      }
    } catch (error) {
      console.error("Error during batch insert:", error);
    } finally {
      this.isFlushing = false;
    }
  }
}
