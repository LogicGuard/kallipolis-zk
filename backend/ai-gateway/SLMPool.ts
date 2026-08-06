import { pipeline } from '@xenova/transformers';
import OpenAI from "openai";

export class SLMPool {
    private models: Map<string, any> = new Map();
    private initPromise: Promise<void>;
    
    constructor() {
        // We defer loading to prevent blocking the main server thread
        this.initPromise = this.initLocalModels();
    }
    
    private async initLocalModels() {
        try {
            // Note: In an actual Edge worker, we would load 'microsoft/Phi-3-mini-4k-instruct'
            // For this environment, we use a much smaller model or fallback to an Ollama endpoint
            // to avoid OOM crashes. Xenova supports many models.
            console.log("[SLMPool] Deferring heavy model loads. Utilizing remote Ollama as Edge node instead.");
        } catch (e) {
            console.error("[SLMPool] Error init local models", e);
        }
    }
    
    async generate(prompt: string, model: string = 'phi-3', baseUrl?: string): Promise<string> {
        await this.initPromise;
        
        // As edge devices (browser/node sandbox) can't easily run 3B+ parameter models 
        // without WebGPU and huge memory, we route SLM requests to a local Ollama instance (acting as the edge node).
        const targetUrl = baseUrl || "http://localhost:11434/v1";
        console.log(`[SLMPool] Routing request to local Edge SLM node at ${targetUrl} (Model: ${model})`);
        
        try {
            const ollama = new OpenAI({ 
                apiKey: "ollama", 
                baseURL: targetUrl,
                dangerouslyAllowBrowser: true 
            });
            
            const response = await ollama.chat.completions.create({
                model: model === 'phi-3' ? 'phi3' : model, 
                messages: [{ role: "user", content: prompt }],
            });
            
            return response.choices[0]?.message?.content || "";
        } catch (error: any) {
            console.error(`[SLMPool] Edge node failure: ${error.message}`);
            // Fallback response for demonstration if Ollama is not actually running
            return "{\"error\": \"SLM Edge Node (Ollama) unreachable. Ensure Ollama is running locally.\"}";
        }
    }
}
