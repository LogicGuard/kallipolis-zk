// Kallipolis ZK Batch MEV Detection Engine
import { detectMEVWasm } from './mev.wasm.service';

interface BatchTask {
  data: string;
  resolve: (result: string[]) => void;
  reject: (err: any) => void;
}

class BatchMEVDetectorEngine {
  private queue: BatchTask[] = [];
  private batchSize = 10;
  private processing = false;
  private batchTimeoutMs = 5;

  public async addTransaction(data: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  private async processBatch() {
    this.processing = true;
    while (this.queue.length > 0) {
      // Collect batch
      const batch = this.queue.splice(0, this.batchSize);
      try {
        const results = await Promise.all(batch.map(task => detectMEVWasm(task.data)));
        for (let i = 0; i < batch.length; i++) {
          batch[i].resolve(results[i]);
        }
      } catch (error) {
        for (const task of batch) {
          task.reject(error);
        }
      }
      // Brief yield if queue is small
      if (this.queue.length === 0) {
        await new Promise(r => setTimeout(r, 1));
      }
    }
    this.processing = false;
  }
}

export const batchMevDetector = new BatchMEVDetectorEngine();
