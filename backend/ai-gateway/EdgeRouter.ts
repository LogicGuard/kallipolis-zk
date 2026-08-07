import { LLMPool } from './LLMPool';
import { SLMPool } from './SLMPool';
import { EdgeCache } from './CacheLayer';
import { AICostMonitor } from './Monitor';
import { globalRateLimiter } from './RateLimiter';
import { FailoverRouter } from './FailoverRouter';

export type GatewayRequest = {
    type?: string;
    prompt: string;
    model_preference?: string; // e.g. "gemini-3.5-flash", "phi-3"
    complexity?: number; // 0.0 to 1.0
    options?: any;
    apiKeys?: { GEMINI?: string, OPENAI?: string, OLLAMA_URL?: string };
    userId?: string; // Add userId for rate limiting
};

export type GatewayResponse = {
    text: string;
    modelUsed: string;
    cached: boolean;
    success: boolean;
    latency: number;
    error?: string;
    raw?: any;
};

export class EdgeRouter {
    private llm_pool: LLMPool;
    private slm_pool: SLMPool;
    private cache: EdgeCache;
    private monitor: AICostMonitor;
    private failoverRouter: FailoverRouter;

    constructor() {
        this.llm_pool = new LLMPool();
        this.slm_pool = new SLMPool();
        this.cache = new EdgeCache();
        this.monitor = new AICostMonitor();
        this.failoverRouter = new FailoverRouter(this.llm_pool, this.slm_pool);
    }

    public async route_request(req: GatewayRequest): Promise<GatewayResponse> {
        // Apply rate limiting
        if (!globalRateLimiter.checkLimit(req.userId || 'anonymous')) {
            return {
                text: "",
                modelUsed: req.model_preference || "unknown",
                cached: false,
                success: false,
                latency: 0,
                error: "Rate limit exceeded. Please wait before sending more requests."
            };
        }

        const startTime = Date.now();
        
        // 1. Request Classification
        const strategy = this.classify_request(req);
        req.model_preference = strategy.model;
        
        // 2. Check Cache
        const cacheRequestObj = { prompt: req.prompt, model: req.model_preference, complexity: req.complexity };
        const cached = await this.cache.get(cacheRequestObj);
        
        if (cached) {
            const latency = Date.now() - startTime;
            cached.cached = true;
            cached.latency = latency;
            return cached as GatewayResponse;
        }
        
        // 3. Select Model Based on Strategy with Failover Routing
        let responseData: any = null;
        let success = false;
        let text = "";
        let errorMsg = "";
        let finalModelUsed = strategy.model;

        try {
            // Build a priority list of providers. 
            // If the requested strategy is 'cost' or the user asked for an SLM, put 'phi-3' first.
            // Otherwise, put the requested cloud model first.
            let preferredProviders = [strategy.model];
            
            if (strategy.type === 'Simple') {
                preferredProviders.push('gemini-2.0-flash'); // Fallback from local to cloud
            } else {
                preferredProviders.push('gemini-2.0-flash');
                preferredProviders.push('gpt-4o'); // Fallback from gemini to openai (or vice versa)
            }
            // Ensure unique providers in list
            preferredProviders = Array.from(new Set(preferredProviders));
            
            const result = await this.failoverRouter.route(req.prompt, preferredProviders, req.apiKeys);
            text = result.text;
            finalModelUsed = result.model;
            responseData = result.raw;
            success = true;
        } catch (e: any) {
            errorMsg = e.message;
            success = false;
        }
        
        const latency = Date.now() - startTime;
        
        const response: GatewayResponse = {
            text,
            modelUsed: finalModelUsed,
            cached: false,
            success,
            latency,
            error: errorMsg || undefined,
            raw: responseData
        };
        
        if (success) {
            // 4. Cache Response
            await this.cache.store(cacheRequestObj, response);
        }
        
        // 5. Track Metrics
        await this.monitor.recordRequest({ model: finalModelUsed, prompt: req.prompt }, response, latency);
        
        return response;
    }
    
    private classify_request(req: GatewayRequest) {
        // Edge-level AI classification using heuristics or tiny model
        // For simplicity, we use heuristic based on complexity score or requested model
        
        const requestedModel = (req.model_preference === 'gemini-3.5-flash' || req.model_preference === 'gemini-2.5-flash' || !req.model_preference) ? 'gemini-2.0-flash' : req.model_preference;
        const isSLMRequested = ['phi-3', 'llama-3', 'llama3', 'mistral'].includes(requestedModel.toLowerCase());
        
        if (isSLMRequested || (req.complexity !== undefined && req.complexity < 0.3)) {
            return {
                type: 'Simple',
                strategy: 'cost',
                model: isSLMRequested ? requestedModel : 'phi-3'
            };
        }
        
        return {
            type: 'Complex',
            strategy: 'quality',
            model: requestedModel
        };
    }
}

// Export a singleton instance
export const edgeRouter = new EdgeRouter();
