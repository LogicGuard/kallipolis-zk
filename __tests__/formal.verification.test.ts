import { describe, it, expect } from 'vitest';
import { Z3FormalVerifier } from '../services/z3.service';

describe('Kallipolis ZK Formal Verification & Z3 Symbolic Engine', () => {
  it('should successfully verify vault balance conservation invariants', () => {
    const result = Z3FormalVerifier.verifyVaultBalanceInvariant([50000, 30000], [20000, 10000]);
    expect(result.is_satisfied).toBe(true);
    expect(result.execution_time_ms).toBeLessThan(10.0);
  });

  it('should detect vault invariant violations when withdrawals exceed deposits', () => {
    const result = Z3FormalVerifier.verifyVaultBalanceInvariant([1000], [5000]);
    expect(result.is_satisfied).toBe(false);
    expect(result.counterexample).toBeDefined();
  });

  it('should verify checks-effects-interactions reentrancy protection', () => {
    const result = Z3FormalVerifier.verifyReentrancyLockInvariant(true, true);
    expect(result.is_satisfied).toBe(true);
  });

  it('should run full invariant verification suite successfully', () => {
    const suite = Z3FormalVerifier.runFullVerificationSuite();
    expect(suite.results.length).toBeGreaterThan(0);
  });
});
