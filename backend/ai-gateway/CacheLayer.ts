import { createHash } from 'crypto';
import { pipeline } from '@xenova/transformers';

// Simple in-memory cache to replace Redis for the Kallipolis ZK preview environment
class MockRedis {
    private store: Map<string, { value: string, expiry: number }> = new Map();

    async get(key: string): Promise<string | null> {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async setex(key: string, seconds: number, value: string): Promise<void> {
        this.store.set(key, { value, expiry: Date.now() + seconds * 1000 });
    }
}

export class EdgeCache {
    private redis: MockRedis;
    private embedder: any = null;
    private localCache: Map<string, any> = new Map();
    private precomputed: Map<string, number[]> = new Map();
    private initPromise: Promise<void>;
    
    constructor() {
        this.redis = new MockRedis();
        
        // Initialize embedding model (local) asynchronously to avoid blocking
        this.initPromise = (async () => {
            try {
                this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                console.log("[EdgeCache] Local embedding model loaded for semantic caching.");
            } catch (error) {
                console.error("[EdgeCache] Failed to load local embedder, semantic cache will fallback to exact match.", error);
            }
        })();
    }
    
    async get(request: any): Promise<any | null> {
        await this.initPromise;
        // 1. Check local L1 cache (Exact match)
        const localKey = this.generateKey(request);
        if (this.localCache.has(localKey)) {
            console.log(`[EdgeCache] L1 Cache Hit for key: ${localKey}`);
            return this.localCache.get(localKey);
        }
        
        // 2. Fast path: check precomputed semantics (O(1))
        if (this.precomputed.has(request.prompt)) {
            const precomputedHash = this.getHashFromEmbedding(this.precomputed.get(request.prompt)!);
            const cached = await this.redis.get(`semantic:${precomputedHash}`);
            if (cached) return JSON.parse(cached);
        }

        // 3. Check Redis L2 cache (Semantic match)
        if (this.embedder) {
            const redisKey = await this.generateSemanticKey(request);
            const cached = await this.redis.get(redisKey);
            if (cached) {
                console.log(`[EdgeCache] L2 Semantic Cache Hit for key: ${redisKey}`);
                const result = JSON.parse(cached);
                // Update L1 cache
                this.localCache.set(localKey, result);
                return result;
            }
        }
        
        return null;
    }
    
    async store(request: any, response: any): Promise<void> {
        await this.initPromise;
        const key = this.generateKey(request);
        
        // Store in L1 (LRU)
        if (this.localCache.size > 1000) {
            const firstKey = this.localCache.keys().next().value;
            if (firstKey) this.localCache.delete(firstKey);
        }
        this.localCache.set(key, response);
        
        // Store in L2 (Redis) with TTL
        if (this.embedder) {
            const embedding = await this.getEmbedding(request.prompt);
            this.precomputed.set(request.prompt, embedding); // Cache the embedding itself
            
            const semanticKey = `semantic:${this.getHashFromEmbedding(embedding)}`;
            await this.redis.setex(
                semanticKey, 
                this.getTTL(request), 
                JSON.stringify(response)
            );
        }
    }
    
    private async getEmbedding(prompt: string): Promise<number[]> {
        if (this.precomputed.has(prompt)) {
            return this.precomputed.get(prompt)!;
        }
        const embedding = await this.embedder(prompt, { pooling: 'mean', normalize: true });
        return Array.from(embedding.data);
    }

    private getHashFromEmbedding(embedding: number[]): string {
        const hash = createHash('sha256')
            .update(JSON.stringify(embedding))
            .digest('hex');
        return hash.substring(0, 32);
    }

    private async generateSemanticKey(request: any): Promise<string> {
        if (!this.embedder) return this.generateKey(request);
        const embedding = await this.getEmbedding(request.prompt);
        return `semantic:${this.getHashFromEmbedding(embedding)}`;
    }

    
    private generateKey(request: any): string {
        return createHash('md5')
            .update(`${request.prompt}-${request.model}`)
            .digest('hex');
    }
    
    private getTTL(request: any): number {
        // TTL based on request complexity (simulate 0.8 threshold)
        const complexity = request.complexity || 0.5;
        return complexity > 0.8 ? 3600 : 86400; // 1 hour vs 1 day
    }
}
