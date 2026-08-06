import { describe, it, expect, beforeEach } from 'vitest';
import { Firewall, LRUCache, TrieMatcher } from '../services/firewall';

describe('LRUCache', () => {
  it('should store and retrieve items correctly', () => {
    const cache = new LRUCache<string, string>(3);
    cache.set('a', '1');
    cache.set('b', '2');
    expect(cache.get('a')).toBe('1');
    expect(cache.get('b')).toBe('2');
  });

  it('should evict least recently used item when capacity is exceeded', () => {
    const cache = new LRUCache<string, string>(2);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.get('a'); // access 'a', making 'b' least recently used
    cache.set('c', '3'); // should evict 'b'

    expect(cache.get('a')).toBe('1');
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe('3');
  });
});

describe('TrieMatcher', () => {
  it('should find patterns in text', () => {
    const trie = new TrieMatcher(['sandwich', 'arbitrage', 'flashloan']);
    const matches = trie.search('0x3ccfd60b_flashloan_arbitrage_vector');
    expect(matches).toContain('flashloan');
    expect(matches).toContain('arbitrage');
    expect(matches).not.toContain('sandwich');
  });

  it('should return empty array when no patterns match', () => {
    const trie = new TrieMatcher(['sandwich', 'drainer']);
    const matches = trie.search('standard_erc20_transfer');
    expect(matches).toEqual([]);
  });
});

describe('Firewall Inspection Service', () => {
  let firewall: Firewall;

  beforeEach(() => {
    firewall = new Firewall();
  });

  it('should allow normal valid transactions', () => {
    const tx = {
      from: '0x1111111111111111111111111111111111111111',
      to: '0x2222222222222222222222222222222222222222',
      data: '0xa9059cbb000000',
      gas: 50000,
      gasPrice: 30e9,
      value: '1000000000000000000'
    };

    const result = firewall.inspect(tx);
    expect(result.blocked).toBe(false);
    expect(result.riskScore).toBe(0);
    expect(result.latency).toBeLessThan(10);
  });

  it('should block blacklisted addresses', () => {
    const tx = {
      from: '0x0000000000000000000000000000000000000000',
      to: '0x2222222222222222222222222222222222222222',
      data: '0x',
      gas: 50000,
      gasPrice: 30e9,
      value: '0'
    };

    const result = firewall.inspect(tx);
    expect(result.blocked).toBe(true);
    expect(result.reasons).toContain('Transaction involves blacklisted address');
  });

  it('should detect MEV sandwich patterns and block', () => {
    const tx = {
      from: '0x3333333333333333333333333333333333333333',
      to: '0x4444444444444444444444444444444444444444',
      data: '0x_sandwich_attack_payload_vector',
      gas: 200000,
      gasPrice: 150e9,
      value: '0'
    };

    const result = firewall.inspect(tx);
    expect(result.blocked).toBe(true);
    expect(result.matchedPatterns).toContain('sandwich');
  });

  it('should cache inspection results for sub-millisecond repeated lookups', () => {
    const tx = {
      from: '0x5555555555555555555555555555555555555555',
      to: '0x6666666666666666666666666666666666666666',
      data: '0x12345678',
      gas: 60000,
      gasPrice: 40e9,
      value: '0'
    };

    const first = firewall.inspect(tx);
    const second = firewall.inspect(tx);
    expect(second.latency).toBeDefined();
    expect(firewall.getCacheSize()).toBeGreaterThan(0);
  });
});
