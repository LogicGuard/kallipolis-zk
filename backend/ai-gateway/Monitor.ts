import prometheus from 'prom-client';

export class AICostMonitor {
    private metrics: any;
    
    constructor() {
        // Prometheus metrics
        // We use a custom registry to avoid conflicts if initialized multiple times in dev mode
        const registry = new prometheus.Registry();
        
        this.metrics = {
            totalRequests: new prometheus.Counter({
                name: 'ai_gateway_total_requests',
                help: 'Total requests to AI Gateway',
                labelNames: ['model', 'status'],
                registers: [registry]
            }),
            requestDuration: new prometheus.Histogram({
                name: 'ai_gateway_request_duration_ms',
                help: 'Request duration in ms',
                buckets: [10, 50, 100, 500, 1000],
                labelNames: ['model'],
                registers: [registry]
            }),
            totalCost: new prometheus.Counter({
                name: 'ai_gateway_total_cost_usd',
                help: 'Total cost in USD',
                labelNames: ['model'],
                registers: [registry]
            }),
        };
    }
    
    async recordRequest(request: any, response: any, latencyMs: number = 0): Promise<void> {
        const cost = this.calculateCost(request, response);
        const success = !response.error;
        
        // Update Prometheus
        this.metrics.totalRequests.inc({
            model: request.model || 'unknown',
            status: success ? 'success' : 'error',
        });
        
        this.metrics.requestDuration.observe({
            model: request.model || 'unknown',
        }, latencyMs);
        
        this.metrics.totalCost.inc({
            model: request.model || 'unknown',
        }, cost);
        
        console.log(`[Cost Monitor] Request tracked: ${request.model} | Cost: $${cost.toFixed(6)} | Latency: ${latencyMs}ms`);
        
        // Alert if cost threshold exceeded
        if (cost > 10) {
            await this.alertHighCost(request, cost);
        }
    }
    
    private calculateCost(request: any, response: any): number {
        // Model-specific pricing (per token)
        const pricing: Record<string, { input: number; output: number }> = {
            'gemini-2.5-pro': { input: 0.00000125, output: 0.000005 },
            'gemini-2.0-flash-exp': { input: 0.0000005, output: 0.0000015 },
            'gpt-4o': { input: 0.000005, output: 0.000015 },
            'claude-3-5-sonnet': { input: 0.000003, output: 0.000015 },
            'phi-3': { input: 0, output: 0 },
            'llama3': { input: 0, output: 0 }
        };
        
        // Use default fallback if model not found
        const price = pricing[request.model] || { input: 0.000001, output: 0.000002 };
        
        // Approximate token counting if not provided by response
        const inputTokens = request.inputTokens || Math.ceil(request.prompt?.length / 4) || 0;
        const outputTokens = response.outputTokens || Math.ceil(response.text?.length / 4) || 0;
        
        return (inputTokens * price.input) + (outputTokens * price.output);
    }
    
    private async alertHighCost(request: any, cost: number) {
        console.warn(`[ALERT] HIGH COST DETECTED: $${cost.toFixed(2)} for a single request using model ${request.model}`);
    }
}
