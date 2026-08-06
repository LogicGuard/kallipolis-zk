// Kallipolis ZK Enterprise Optimized Mempool Firewall
// Implements Trie pattern matching, LRU Cache, MEVDetector, GasValidator, AddressBlacklist, and MempoolFirewall.

import { createHash } from 'crypto';

// ============================================================
// 1. Trie Data Structure for Pattern Matching
// ============================================================
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
  pattern: string = '';
}

export class Trie {
  private root: TrieNode = new TrieNode();
  private count: number = 0;

  constructor(patterns?: string[]) {
    if (patterns) {
      for (const p of patterns) {
        this.insert(p);
      }
    }
  }

  insert(pattern: string): void {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
    node.pattern = pattern;
    this.count++;
  }

  search(text: string): string[] {
    const matches: Set<string> = new Set();
    const len = text.length;
    for (let i = 0; i < len; i++) {
      let node = this.root;
      for (let j = i; j < len; j++) {
        const char = text[j];
        if (!node.children.has(char)) break;
        node = node.children.get(char)!;
        if (node.isEnd) {
          matches.add(node.pattern);
        }
      }
    }
    return Array.from(matches);
  }

  size(): number {
    return this.count;
  }
}

// ============================================================
// 2. LRU Cache for Performance
// ============================================================
class LRUNode<K, V> {
  key: K;
  value: V;
  prev: LRUNode<K, V> | null = null;
  next: LRUNode<K, V> | null = null;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, LRUNode<K, V>>();
  private head: LRUNode<K, V> | null = null;
  private tail: LRUNode<K, V> | null = null;

  constructor(capacity: number = 10000) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  set(key: K, value: V): void {
    let node = this.map.get(key);
    if (node) {
      node.value = value;
      this.moveToHead(node);
      return;
    }
    if (this.map.size >= this.capacity) {
      this.evictTail();
    }
    node = new LRUNode(key, value);
    this.map.set(key, node);
    this.addToHead(node);
  }

  private moveToHead(node: LRUNode<K, V>) {
    if (this.head === node) return;
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: LRUNode<K, V>) {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode<K, V>) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evictTail() {
    if (!this.tail) return;
    this.map.delete(this.tail.key);
    this.removeNode(this.tail);
  }

  size(): number {
    return this.map.size;
  }

  clear() {
    this.map.clear();
    this.head = null;
    this.tail = null;
  }
}

// ============================================================
// 3. MEV Detector Component
// ============================================================
export interface MEVPattern {
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export class MEVDetector {
  private trie: Trie;
  private knownPatterns: MEVPattern[] = [
    { name: 'sandwich', severity: 'CRITICAL', description: 'Sandwich attack pattern detected' },
    { name: 'frontrun', severity: 'HIGH', description: 'Front-running high gas priority' },
    { name: 'arbitrage', severity: 'MEDIUM', description: 'Cross-DEX arbitrage attempt' },
    { name: 'flashloan', severity: 'HIGH', description: 'Flash loan contract interaction' },
    { name: '0x7ff36ab5', severity: 'MEDIUM', description: 'DEX router swap signature' },
    { name: '0x3ccfd60b', severity: 'HIGH', description: 'Flash loan execution selector' }
  ];

  constructor() {
    this.trie = new Trie(this.knownPatterns.map(p => p.name));
  }

  detect(data: string): { patterns: MEVPattern[]; riskScore: number } {
    const foundNames = this.trie.search((data || '').toLowerCase());
    const patterns: MEVPattern[] = [];
    let riskScore = 0;

    for (const name of foundNames) {
      const p = this.knownPatterns.find(item => item.name === name);
      if (p) {
        patterns.push(p);
        riskScore += p.severity === 'CRITICAL' ? 50 : p.severity === 'HIGH' ? 30 : 15;
      }
    }

    return {
      patterns,
      riskScore: Math.min(100, riskScore)
    };
  }
}

// ============================================================
// 4. Gas Validator Component
// ============================================================
export class GasValidator {
  private minGas: number = 21000;
  private maxGas: number = 15000000;

  validate(gas: number): { valid: boolean; reason?: string } {
    if (gas < this.minGas) {
      return { valid: false, reason: 'Gas limit below minimum transfer requirement (21000)' };
    }
    if (gas > this.maxGas) {
      return { valid: false, reason: 'Gas limit exceeds safe block ceiling (15M)' };
    }
    return { valid: true };
  }
}

// ============================================================
// 5. Address Blacklist Component
// ============================================================
export class AddressBlacklist {
  private blacklist: Set<string> = new Set([
    '0x0000000000000000000000000000000000000000',
    '0xdead00000000000000000000000000000000dead',
    '0xbad000000000000000000000000000000000bad'
  ]);

  add(address: string) {
    this.blacklist.add(address.toLowerCase());
  }

  remove(address: string) {
    this.blacklist.delete(address.toLowerCase());
  }

  isBlacklisted(address: string): boolean {
    if (!address) return false;
    return this.blacklist.has(address.toLowerCase());
  }
}

// ============================================================
// 6. MempoolFirewall Main Class
// ============================================================
export interface TransactionInput {
  hash?: string;
  from: string;
  to: string;
  data: string;
  gas: number;
  gasPrice?: number;
  value?: string;
}

export interface InspectionResult {
  transaction_id: string;
  blocked: boolean;
  reasons: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metrics: {
    execution_time_ms: number;
    p99_target_ms: number;
    cached: boolean;
  };
  timestamp: string;
  matchedPatterns?: string[];
}

export class MempoolFirewall {
  private cache = new LRUCache<string, InspectionResult>(10000);
  private mevDetector = new MEVDetector();
  private gasValidator = new GasValidator();
  private addressBlacklist = new AddressBlacklist();

  public inspect(tx: TransactionInput): InspectionResult {
    const startTime = performance.now();
    const txHash = tx.hash || createHash('md5').update(JSON.stringify(tx)).digest('hex');
    const cacheKey = `${tx.from}-${tx.to}-${tx.data?.substring(0, 32)}-${tx.gas}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      const elapsed = performance.now() - startTime;
      return {
        ...cached,
        metrics: {
          ...cached.metrics,
          cached: true,
          execution_time_ms: Math.max(0.01, Math.round(elapsed * 100) / 100)
        }
      };
    }

    const reasons: string[] = [];
    let blocked = false;

    // 1. Blacklist check
    if (this.addressBlacklist.isBlacklisted(tx.from) || this.addressBlacklist.isBlacklisted(tx.to)) {
      blocked = true;
      reasons.push('Transaction involves blacklisted entity address');
    }

    // 2. Gas validation
    const gasCheck = this.gasValidator.validate(tx.gas);
    if (!gasCheck.valid) {
      blocked = true;
      reasons.push(gasCheck.reason!);
    }

    // 3. MEV / Threat Detection via Trie
    const mevResult = this.mevDetector.detect(tx.data);
    if (mevResult.patterns.length > 0) {
      reasons.push(`MEV / Threat signatures detected: ${mevResult.patterns.map(p => p.name).join(', ')}`);
      if (mevResult.riskScore >= 30 || mevResult.patterns.some(p => p.severity === 'CRITICAL')) {
        blocked = true;
      }
    }

    const risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = blocked ? (mevResult.riskScore > 40 ? 'CRITICAL' : 'HIGH') : (mevResult.riskScore > 0 ? 'MEDIUM' : 'LOW');
    const execution_time_ms = Math.max(0.02, Math.round((performance.now() - startTime) * 100) / 100);

    const result: InspectionResult = {
      transaction_id: txHash,
      blocked,
      reasons,
      risk_level,
      metrics: {
        execution_time_ms,
        p99_target_ms: 15.0,
        cached: false
      },
      timestamp: new Date().toISOString(),
      matchedPatterns: mevResult.patterns.map(p => p.name)
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  public getCacheSize(): number {
    return this.cache.size();
  }
}

// ============================================================
// 7. Factory Function & Helper Exports
// ============================================================
let globalFirewallInstance: MempoolFirewall | null = null;

export function getFirewall(): MempoolFirewall {
  if (!globalFirewallInstance) {
    globalFirewallInstance = new MempoolFirewall();
  }
  return globalFirewallInstance;
}

export async function checkFirewallOptimized(transaction: TransactionInput): Promise<InspectionResult> {
  const fw = getFirewall();
  return fw.inspect(transaction);
}
