import type { AnyPgTable } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";
import { getConfig } from "../config/get-config";

export class BatchQueue {
  private queue = new Map<AnyPgTable, InferInsertModel<AnyPgTable>[]>();
  private config = getConfig();
  private getExisting<T extends AnyPgTable>(table: T): InferInsertModel<T>[] {
    return (this.queue.get(table) ?? []) as InferInsertModel<T>[];
  }

  private totalEntries = 0;

  size() {
    return this.totalEntries;
  }

  add<T extends AnyPgTable>(table: T, data: InferInsertModel<T>): boolean {
    const existing = this.getExisting(table);
    existing.push(data);
    this.queue.set(table, existing);
    const shouldFlush = existing.length >= this.config.maxBatchSize;
    this.totalEntries += 1;
    return shouldFlush;
  }

  commit<T extends AnyPgTable>(table: T, count: number) {
    const existing = this.getExisting(table);
    return existing.splice(0, count);
  }

  peak<T extends AnyPgTable>(table: T, max: number): InferInsertModel<T>[] {
    const existing = this.getExisting(table);
    const batch = existing.slice(0, max);

    if (existing.length === 0) {
      this.queue.delete(table);
    }

    this.totalEntries -= batch.length;

    return batch;
  }

  entries() {
    return this.queue.entries();
  }

  isEmpty() {
    return this.queue.size === 0;
  }

  clear() {
    this.queue.clear();
    this.totalEntries = 0;
  }
}
