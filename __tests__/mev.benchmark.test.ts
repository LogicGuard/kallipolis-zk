import { describe, it, expect } from 'vitest';
import { detectMEVWasm } from '../services/mev.wasm.service';
import { batchMevDetector } from '../services/mev.batch.service';

function generateMEVTransactions(count: number): string[] {
  const payloads = [
    '0x7ff36ab5_swap_exact_tokens',
    '0x18cbafe5_arbitrage_flash_loan',
    'standard_transfer_method',
    'sandwich_vector_attack_payload',
    'normal_erc20_transfer'
  ];
  return Array.from({ length: count }, (_, i) => payloads[i % payloads.length] + '_' + i);
}

function calculateP99(latencies: number[]): number {
  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.floor(0.99 * sorted.length);
  return sorted[index] || sorted[sorted.length - 1];
}

describe('MEV Detection Performance Benchmarks', () => {
  it('should detect MEV under 50ms P99 latency with batch processing', async () => {
    const txs = generateMEVTransactions(500);
    const latencies: number[] = [];

    // Warm-up
    for (let i = 0; i < 20; i++) {
      await batchMevDetector.addTransaction(txs[i]);
    }

    const startTimeTotal = performance.now();

    for (const tx of txs) {
      const start = performance.now();
      await batchMevDetector.addTransaction(tx);
      const elapsed = performance.now() - start;
      latencies.push(elapsed);
    }

    const totalTime = performance.now() - startTimeTotal;
    const p99 = calculateP99(latencies);
    const throughput = (txs.length / (totalTime / 1000)).toFixed(2);

    console.log(`[MEV BENCHMARK] Total: ${totalTime.toFixed(2)}ms | Throughput: ${throughput} tx/s | P99: ${p99.toFixed(2)}ms`);

    expect(p99).toBeLessThan(50.0);
    expect(Number(throughput)).toBeGreaterThan(100); // High throughput verification
  });
});
