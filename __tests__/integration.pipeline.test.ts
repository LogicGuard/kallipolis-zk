import { describe, it, expect } from 'vitest';
import { MempoolFirewall } from '../services/firewall.optimized';
import { PolyglotEngineManager } from '../services/polyglot/polyglot.service';
import { Z3FormalVerifier } from '../services/z3.service';

describe('Integration Test Suite: Gateway -> Firewall -> Consensus -> Polyglot Pipeline', () => {
  it('should run full transaction pipeline validation through Firewall and Polyglot engines', async () => {
    // 1. Mempool Firewall Inspection
    const firewall = new MempoolFirewall();
    const txInput = {
      from: '0x1111111111111111111111111111111111111111',
      to: '0x2222222222222222222222222222222222222222',
      data: '0x7ff36ab5000000000000000000000000',
      gas: 150000,
    };

    const inspection = firewall.inspect(txInput);
    expect(inspection.transaction_id).toBeDefined();
    expect(inspection.metrics.execution_time_ms).toBeGreaterThanOrEqual(0);

    // 2. Zig Zero-Alloc Mempool Inspection
    const zigRes = PolyglotEngineManager.runZigMempoolParser(txInput.data);
    expect(zigRes.selector).toBe('0x7ff36ab5');
    expect(zigRes.risk_score).toBeGreaterThanOrEqual(0);

    // 3. Nim RPC Relay Filtering
    const nimRes = PolyglotEngineManager.runNimRpcRelay('eth_sendRawTransaction', []);
    expect(nimRes.allowed).toBe(true);

    // 4. Formal Invariant Verification via Z3 / OCaml
    const z3Res = Z3FormalVerifier.runFullVerificationSuite();
    expect(z3Res.all_passed).toBe(true);
    expect(z3Res.results.length).toBeGreaterThan(0);
  });
});
