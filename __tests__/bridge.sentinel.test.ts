import { describe, it, expect } from 'vitest';
import { BridgeSentinelService } from '../services/bridge.sentinel.service';

describe('BridgeSentinelService', () => {
  const sentinel = new BridgeSentinelService();

  it('should verify valid bridge transfer requests', () => {
    const res = sentinel.verifyTransfer({
      bridgeId: 'BRIDGE-01',
      sourceChainId: 1,
      destinationChainId: 1101,
      depositor: '0x123...',
      receiver: '0x456...',
      amount: '1000000000000000000',
      merkleRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      proof: ['0xabc']
    });

    expect(res.verified).toBe(true);
    expect(res.riskScore).toBe(0);
    expect(res.anomalyDetected).toBe(false);
  });

  it('should reject transfers with missing proofs or invalid merkle root', () => {
    const res = sentinel.verifyTransfer({
      bridgeId: 'BRIDGE-02',
      sourceChainId: 1,
      destinationChainId: 1101,
      depositor: '0x123...',
      receiver: '0x456...',
      amount: '1000000000000000000',
      merkleRoot: 'invalid_root',
      proof: []
    });

    expect(res.verified).toBe(false);
    expect(res.anomalyDetected).toBe(true);
  });

  it('should return active bridge status list', () => {
    const bridges = sentinel.getBridgeStatus();
    expect(bridges.length).toBeGreaterThan(0);
    expect(bridges.some(b => b.chainId === 1101)).toBe(true);
  });
});
