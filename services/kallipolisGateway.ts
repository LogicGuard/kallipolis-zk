import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export type ProviderType = "GEMINI" | "OPENAI" | "OLLAMA" | "ANTHROPIC";
export type RoutingStrategy = "cost" | "fast" | "quality" | "balanced";

export interface GatewayConfig {
    defaultProvider: ProviderType;
    strategy: RoutingStrategy;
    providers: {
        GEMINI?: { apiKey: string };
        OPENAI?: { apiKey: string };
        OLLAMA?: { baseUrl: string }; // e.g., http://localhost:11434/v1
        ANTHROPIC?: { apiKey: string };
    };
    routing: {
        cost: ProviderType;
        fast: ProviderType;
        quality: ProviderType;
        balanced: ProviderType;
    }
}

import { edgeRouter } from '../backend/ai-gateway/EdgeRouter';
import { consensusEngine } from '../backend/ai-gateway/ConsensusEngine';
import type { Verdict } from '../backend/ai-gateway/ConsensusEngine';

export type { Verdict };

// Default config that can be updated from UI
let currentConfig: GatewayConfig = {
    defaultProvider: "GEMINI",
    strategy: "balanced",
    providers: {
        GEMINI: { apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" },
        OPENAI: { apiKey: process.env.OPENAI_API_KEY || "" },
        OLLAMA: { baseUrl: "http://localhost:11434/v1" }
    },
    routing: {
        cost: "OLLAMA",
        fast: "GEMINI",
        quality: "OPENAI",
        balanced: "GEMINI"
    }
};

export const updateGatewayConfig = (newConfig: Partial<GatewayConfig>) => {
    currentConfig = { ...currentConfig, ...newConfig };
};

export const getGatewayConfig = () => currentConfig;

// Core Abstraction function (Using EdgeRouter)
export class KallipolisAIGateway {
    static async generateContent(prompt: string, configOverrides?: { provider?: ProviderType, model?: string, config?: any, userId?: string }): Promise<any> {
        const provider = configOverrides?.provider || currentConfig.routing[currentConfig.strategy] || currentConfig.defaultProvider;
        
        let targetModel = configOverrides?.model;
        if (!targetModel || targetModel === "gemini-3.5-flash" || targetModel === "gemini-2.5-flash") {
            targetModel = provider === "OLLAMA" ? "phi-3" : (provider === "OPENAI" ? "gpt-4o" : "gemini-2.0-flash");
        }

        const apiKeys = {
            GEMINI: currentConfig.providers.GEMINI?.apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY,
            OPENAI: currentConfig.providers.OPENAI?.apiKey || process.env.OPENAI_API_KEY,
            OLLAMA_URL: currentConfig.providers.OLLAMA?.baseUrl
        };

        const response = await edgeRouter.route_request({
            prompt,
            model_preference: targetModel,
            complexity: configOverrides?.provider === "OLLAMA" ? 0.2 : 0.8, // hint for EdgeRouter classification
            options: configOverrides?.config,
            apiKeys,
            userId: configOverrides?.userId
        });

        if (!response.success) {
            console.warn(`[Gateway] Primary provider ${provider} failed: ${response.error}. Attempting fallback to GEMINI.`);
            const fallbackResponse = await edgeRouter.route_request({
                prompt,
                model_preference: "gemini-2.0-flash",
                complexity: 0.8,
                options: configOverrides?.config,
                apiKeys,
                userId: configOverrides?.userId
            });
            return fallbackResponse.raw || { text: fallbackResponse.text, candidates: [] };
        }

        return response.raw || { text: response.text, candidates: [] };
    }

    static async getConsensusVerdict(data: any, analysisType: 'MEV' | 'FIREWALL' | 'AUDIT'): Promise<Verdict> {
        return await consensusEngine.getVerdict(data, analysisType);
    }
}
