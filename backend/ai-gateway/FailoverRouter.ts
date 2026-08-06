import { LLMPool } from './LLMPool';
import { SLMPool } from './SLMPool';

export class FailoverRouter {
    private llmPool: LLMPool;
    private slmPool: SLMPool;
    
    // Ordered by preference: local first (cost/privacy), then primary cloud, then fallback cloud
    private defaultProviders = ['phi-3', 'gemini-3.5-flash', 'gpt-4o'];
    private currentIndex = 0;
    
    constructor(llmPool: LLMPool, slmPool: SLMPool) {
        this.llmPool = llmPool;
        this.slmPool = slmPool;
    }
    
    async route(prompt: string, preferredProviders: string[] = this.defaultProviders, apiKeys?: any): Promise<{text: string, model: string, raw?: any}> {
        const errors = [];
        for (let i = 0; i < preferredProviders.length; i++) {
            const provider = preferredProviders[(this.currentIndex + i) % preferredProviders.length];
            try {
                console.log(`[FailoverRouter] Attempting generation with provider: ${provider}`);
                
                if (['phi-3', 'llama-3', 'mistral'].includes(provider.toLowerCase())) {
                    const text = await this.slmPool.generate(prompt, provider, apiKeys?.OLLAMA_URL);
                    return { text, model: provider };
                } else {
                    const res = await this.llmPool.generate(prompt, provider, undefined, apiKeys);
                    return { text: res.text, model: provider, raw: res.response };
                }
            } catch (error: any) {
                console.error(`[FailoverRouter] Provider ${provider} failed:`, error.message);
                errors.push(`${provider}: ${error.message}`);
                
                // If rate limited, wait a bit before trying the next provider or before retrying
                if (error.message.includes("429") || error.status === 429) {
                    console.log(`[FailoverRouter] Rate limited on ${provider}. Waiting...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
                continue; // Try next provider
            }
        }
        throw new Error(`All providers failed. Errors: ${errors.join(' | ')}`);
    }
}
