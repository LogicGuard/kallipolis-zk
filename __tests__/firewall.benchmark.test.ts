import { describe, it, expect } from 'vitest';
import { checkFirewallOptimized } from '../services/firewall.optimized';

describe('Kallipolis ZK Mempool Firewall Performance Benchmarks', () => {
  it('should process 1000 transactions under 15ms P99 latency', async () => {
    const transactions = Array.from({ length: 1000 }, (_, i) => ({
      hash: `0xabc${i}`,
      from: i % 10 === 0 ? '0x0000000000000000000000000000000000000000' : `0xuser${i}`,
      to: '0xcontract123',
      data: i % 5 === 0 ? '0x7ff36ab500000000000000000000000000000000' : '0xa9059cbb00000',
      gas: 50000 + (i % 1000)
    }));

    const latencies: number[] = [];

    // Warm-up cache and JIT
    for (let i = 0; i < 50; i++) {
      await checkFirewallOptimized(transactions[i]);
    }

    for (const tx of transactions) {
      const start = performance.now();
      await checkFirewallOptimized(tx);
      const elapsed = performance.now() - start;
      latencies.push(elapsed);
    }

    latencies.sort((a, b) => a - b);
    const p99Index = Math.floor(0.99 * latencies.length);
    const p99Latency = latencies[p99Index];
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log(`[FIREWALL BENCHMARK] Avg Latency: ${avgLatency.toFixed(2)}ms | P99 Latency: ${p99Latency.toFixed(2)}ms`);

    expect(p99Latency).toBeLessThan(15.0);
  });
});
