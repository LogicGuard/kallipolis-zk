// Kallipolis ZK Enterprise Mempool Firewall (Trie + LRU Cache)
// Provides sub-millisecond transaction inspection for MEV, gas anomalies, and security threats.

export interface TransactionInput {
  hash?: string;
  from: string;
  to: string;
  data: string;
  gas: number;
  gasPrice: number;
  value: string;
  nonce?: number;
}

export interface InspectionResult {
  blocked: boolean;
  reasons: string[];
  latency: number;
  riskScore: number;
  matchedPatterns: string[];
}

// ============================================================
// 1. High-Performance LRU Cache
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
// 2. Trie Pattern Matcher
// ============================================================
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEnd: boolean = false;
  pattern: string = '';
}

export class TrieMatcher {
  private root = new TrieNode();
  private count = 0;

  constructor(patterns: string[]) {
    for (const p of patterns) {
      this.insert(p);
    }
  }

  insert(pattern: string) {
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
// 3. Main Firewall Class
// ============================================================
export class Firewall {
  private cache: LRUCache<string, InspectionResult>;
  private trie: TrieMatcher;
  private blacklist: Set<string>;

  constructor(cacheCapacity: number = 10000) {
    this.cache = new LRUCache<string, InspectionResult>(cacheCapacity);
    
    // MEV & Threat Signatures
    const signatures = [
      'sandwich',
      'frontrun',
      'arbitrage',
      'flashloan',
      '0x3ccfd60b', // flashloan selector
      '0x7ff36ab5', // swap selector
      'reentrancy',
      'spoof',
      'drainer',
      'malicious_proxy'
    ];
    this.trie = new TrieMatcher(signatures);

    this.blacklist = new Set([
      '0x0000000000000000000000000000000000000000',
      '0x000000000000000000000000000000000000dead',
      '0xbad10c000000000000000000000000000000bada'
    ]);
  }

  public inspect(tx: TransactionInput): InspectionResult {
    const startTime = performance.now();
    
    // Generate cache key
    const cacheKey = `${tx.from}-${tx.to}-${tx.data?.substring(0, 32)}-${tx.gasPrice}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const elapsed = performance.now() - startTime;
      return { ...cached, latency: Math.max(0.01, Math.round(elapsed * 100) / 100) };
    }

    const reasons: string[] = [];
    let blocked = false;
    let riskScore = 0;

    // 1. Blacklist Check
    if (this.blacklist.has(tx.from.toLowerCase()) || this.blacklist.has(tx.to?.toLowerCase() || '')) {
      blocked = true;
      reasons.push('Transaction involves blacklisted address');
      riskScore += 100;
    }

    // 2. Gas Limit Validation
    if (tx.gas < 21000) {
      blocked = true;
      reasons.push('Gas limit below standard transfer minimum (21,000)');
      riskScore += 50;
    }
    if (tx.gas > 15000000) {
      blocked = true;
      reasons.push('Gas limit exceeds maximum safe block allocation (15M)');
      riskScore += 40;
    }

    // 3. Gas Price Anomalies (Frontrunning / Sandwich indicator)
    if (tx.gasPrice > 500e9) { // > 500 Gwei
      reasons.push('Extreme gas price spike detected (potential front-running vector)');
      riskScore += 35;
    }

    // 4. Calldata Pattern Matching via Trie
    const dataLower = (tx.data || '').toLowerCase();
    const matchedPatterns = this.trie.search(dataLower);

    if (matchedPatterns.length > 0) {
      reasons.push(`Matched known threat/MEV signatures: ${matchedPatterns.join(', ')}`);
      riskScore += matchedPatterns.length * 25;
      
      if (matchedPatterns.includes('sandwich') || matchedPatterns.includes('drainer')) {
        blocked = true;
      }
    }

    // Normalize risk score
    riskScore = Math.min(100, riskScore);

    const latency = Math.max(0.02, Math.round((performance.now() - startTime) * 100) / 100);

    const result: InspectionResult = {
      blocked,
      reasons,
      latency,
      riskScore,
      matchedPatterns
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  public addBlacklist(address: string) {
    this.blacklist.add(address.toLowerCase());
  }

  public getCacheSize(): number {
    return this.cache.size();
  }
}

export const globalFirewall = new Firewall();
