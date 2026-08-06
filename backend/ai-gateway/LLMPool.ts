import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
// We don't have anthropic installed, we will mock it if requested or add it later

export class LLMPool {
    private _gemini: GoogleGenAI | null = null;
    private _openai: OpenAI | null = null;
    
    constructor() {}

    private get gemini() {
        if (!this._gemini) {
            this._gemini = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
        }
        return this._gemini;
    }

    private get openai() {
        if (!this._openai) {
            this._openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true });
        }
        return this._openai;
    }
    
    async generate(
        prompt: string, 
        model: 'gemini' | 'gpt-4' | 'claude' | string,
        options?: any,
        apiKeys?: { GEMINI?: string, OPENAI?: string }
    ): Promise<{text: string, response: any}> {
        const providerName = model.startsWith('gemini') ? 'gemini' : (model.startsWith('gpt') ? 'gpt-4' : model);
        
        switch(providerName) {
            case 'gemini':
                return this.geminiGenerate(prompt, model, options, apiKeys?.GEMINI);
            case 'gpt-4':
                return this.openaiGenerate(prompt, model, options, apiKeys?.OPENAI);
            case 'claude':
                throw new Error("Anthropic SDK not initialized. Please install @anthropic-ai/sdk");
            default:
                // Try gemini as default
                return this.geminiGenerate(prompt, "gemini-3.5-flash", options, apiKeys?.GEMINI);
        }
    }
    
    private async geminiGenerate(prompt: string, modelId: string, options?: any, customKey?: string): Promise<{text: string, response: any}> {
        const ai = customKey ? new GoogleGenAI({ apiKey: customKey }) : this.gemini;
        const response = await ai.models.generateContent({ 
            model: modelId, 
            contents: prompt,
            config: options 
        });
        return { text: response.text || "", response };
    }

    private async openaiGenerate(prompt: string, modelId: string, options?: any, customKey?: string): Promise<{text: string, response: any}> {
        const client = customKey ? new OpenAI({ apiKey: customKey, dangerouslyAllowBrowser: true }) : this.openai;
        const response = await client.chat.completions.create({
            model: modelId,
            messages: [{ role: "user", content: prompt }],
            response_format: options?.responseMimeType === "application/json" ? { type: "json_object" } : undefined
        });
        return { text: response.choices[0]?.message?.content || "", response };
    }
}
