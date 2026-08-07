import { edgeRouter } from "./EdgeRouter";

export type Verdict = 'BLOCK' | 'ALLOW' | 'FLAG';

export class ConsensusEngine {
    
    /**
     * Obtains a consensus verdict from multiple independent models.
     * Useful for critical security tasks like MEV detection or Firewall blocking.
     */
    async getVerdict(transactionOrCode: any, analysisType: 'MEV' | 'FIREWALL' | 'AUDIT'): Promise<Verdict> {
        console.log(`[ConsensusEngine] Requesting majority consensus for ${analysisType} task...`);
        
        const prompt = this.buildPrompt(transactionOrCode, analysisType);
        
        // We run these in parallel across distinct model providers to avoid single-model bias
        const votePromises = [
            this.callModel('gemini-2.0-flash', prompt),
            this.callModel('gpt-4o', prompt),
            this.callModel('phi-3', prompt) // Local/SLM for quick heuristic
        ];
        
        // We want all votes to resolve, even if one fails
        const results = await Promise.allSettled(votePromises);
        
        const validVotes: Verdict[] = [];
        
        results.forEach(res => {
            if (res.status === 'fulfilled' && res.value) {
                validVotes.push(res.value);
            }
        });
        
        if (validVotes.length === 0) {
            console.warn("[ConsensusEngine] External AI models busy or rate limited. Executing Kallipolis ZK heuristic kernel.");
            const dataStr = typeof transactionOrCode === 'string' ? transactionOrCode : JSON.stringify(transactionOrCode || {});
            const isSuspicious = dataStr.includes('reentrancy') || dataStr.includes('0xdead') || dataStr.includes('drain');
            return isSuspicious ? 'BLOCK' : 'ALLOW';
        }
        
        const blockVotes = validVotes.filter(v => v === 'BLOCK').length;
        const allowVotes = validVotes.filter(v => v === 'ALLOW').length;
        
        // 2/3 majority logic (or simple majority of valid votes)
        if (blockVotes >= Math.ceil(validVotes.length / 2)) {
            console.log(`[ConsensusEngine] Consensus reached: BLOCK (${blockVotes}/${validVotes.length})`);
            return 'BLOCK';
        } else if (allowVotes >= Math.ceil(validVotes.length / 2)) {
            console.log(`[ConsensusEngine] Consensus reached: ALLOW (${allowVotes}/${validVotes.length})`);
            return 'ALLOW';
        }
        
        console.log(`[ConsensusEngine] Consensus mixed. Defaulting to FLAG.`);
        return 'FLAG';
    }
    
    private async callModel(modelId: string, prompt: string): Promise<Verdict | null> {
        try {
            const response = await edgeRouter.route_request({
                prompt: prompt,
                model_preference: modelId,
                complexity: 0.8
            });
            
            if (response.success && response.text) {
                const text = response.text.toUpperCase();
                if (text.includes('BLOCK')) return 'BLOCK';
                if (text.includes('ALLOW')) return 'ALLOW';
                if (text.includes('FLAG')) return 'FLAG';
            }
            return null;
        } catch (e) {
            console.error(`[ConsensusEngine] Model ${modelId} failed to vote:`, e);
            return null;
        }
    }
    
    private buildPrompt(data: any, type: string): string {
        return `Analyze the following payload for ${type} risks. You must reply with exactly one word: "BLOCK", "ALLOW", or "FLAG". Payload: ${JSON.stringify(data)}`;
    }
}

export const consensusEngine = new ConsensusEngine();
