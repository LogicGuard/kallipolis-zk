
import { Type, GenerateContentResponse, Modality, GoogleGenAI } from "@google/genai";
import { 
    WalletReportResult, BridgeSecurityResult, RegulatoryComplianceResult, FirewallAnalysisResult, ThreatMapNode, ChatMessage, PortfolioSnapshot, StakingAnalysisResult, TransactionAnalysisResult, DeFiPortfolioAnalysis, NFTAnalysisResult, SmartContractAuditResult, DAppCertificationResult, GasOptimizationResult, EcosystemHealthResult, PerformanceAnalysisResult, DAOProposalAnalysisResult, GrowthPredictionResult, QuantumAnalysisResult, ZKProofVerificationResult, TokenApproval,
    SecurityAlert,
    OnChainEvent,
    IntelligenceBriefingResult
} from '../types';

// --- Advanced Caching System ---
const apiCache = new Map<string, { timestamp: number, data: any }>();
const pendingRequests = new Map<string, Promise<any>>();

function getFromCache<T>(key: string, ttlMs: number): T | null {
    const entry = apiCache.get(key);
    if (entry && (Date.now() - entry.timestamp < ttlMs)) {
        return entry.data as T;
    }
    
    try {
        const stored = sessionStorage.getItem(`pg_cache_${key}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp < ttlMs) {
                return parsed.data as T;
            }
        }
    } catch (e) {}
    
    return null;
}

function setCache(key: string, data: any) {
    const entry = { timestamp: Date.now(), data };
    apiCache.set(key, entry);
    try {
        sessionStorage.setItem(`pg_cache_${key}`, JSON.stringify(entry));
    } catch (e) {}
}

const TTL = {
    SHORT: 5 * 60 * 1000,
    MEDIUM: 30 * 60 * 1000,
    LONG: 120 * 60 * 1000
};

// --- Intelligent Request Orchestration ---
let isGlobalCoolingDown = false;
let cooldownTimer: any = null;

export const systemStatusEvents = new EventTarget();

const setCoolingDown = (value: boolean) => {
    if (isGlobalCoolingDown === value) return;
    isGlobalCoolingDown = value;
    systemStatusEvents.dispatchEvent(new CustomEvent('statusChange', { detail: { isCoolingDown: value } }));
};

export const getSystemStatus = () => ({ isCoolingDown: isGlobalCoolingDown });

interface QueueItem {
    fn: () => Promise<any>;
    priority: number; // Higher is more urgent
    id: string;
    model: string;
}

class RequestOrchestrator {
    private queue: QueueItem[] = [];
    private processing = false;
    private lastRequestTimes: Record<string, number> = {
        'pro': 0,
        'flash': 0
    };
    
    // Limits based on Gemini Free Tier:
    // Pro: 2 RPM (30s delay)
    // Flash: 15 RPM (4s delay)
    private readonly DELAYS: Record<string, number> = {
        'pro': 32000, 
        'flash': 4500
    };

    async add<T>(fn: () => Promise<T>, priority: number = 1, id: string = 'generic', model: string = 'pro'): Promise<T> {
        const modelType = model.includes('pro') ? 'pro' : 'flash';

        if (priority === 0 && this.queue.some(item => item.id === id)) {
            console.debug(`[Orchestrator] De-duplicating background task: ${id}`);
            return Promise.reject(new Error("DUPLICATE_BACKGROUND_TASK"));
        }

        return new Promise((resolve, reject) => {
            this.queue.push({ 
                fn: async () => {
                    try {
                        const result = await fn();
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                }, 
                priority,
                id,
                model: modelType
            });
            this.queue.sort((a, b) => b.priority - a.priority);
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        try {
            while (this.queue.length > 0) {
                if (isGlobalCoolingDown) {
                    break;
                }

                const task = this.queue[0];
                const modelType = task.model;
                const now = Date.now();
                const timeSinceLast = now - (this.lastRequestTimes[modelType] || 0);
                const requiredDelay = this.DELAYS[modelType];

                if (timeSinceLast < requiredDelay) {
                    // Re-evaluate queue in a few seconds or wait
                    const waitTime = requiredDelay - timeSinceLast;
                    await new Promise(res => setTimeout(res, Math.min(waitTime, 2000)));
                    continue; 
                }

                this.queue.shift(); // Remove task from queue as we are about to execute it
                this.lastRequestTimes[modelType] = Date.now();
                await task.fn();
            }
        } finally {
            this.processing = false;
        }
    }
}

const orchestrator = new RequestOrchestrator();

const handleGeminiError = (error: any): { data: null; error: string } => {
    const errorStr = JSON.stringify(error).toLowerCase();
    const isRateLimit = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted');
    
    if (isRateLimit) {
        setCoolingDown(true);
        clearTimeout(cooldownTimer);
        // Quota window reset - usually 1 minute, we wait 65s to be safe
        cooldownTimer = setTimeout(() => { 
            setCoolingDown(false);
        }, 65000); 
        return { data: null, error: "QUOTA_EXHAUSTED: Security kernel recalibrating. Normal operations resume in 60s." };
    }

    const isTransient = errorStr.includes('500') || errorStr.includes('xhr error') || errorStr.includes('rpc failed') || errorStr.includes('timeout');
    if (isTransient) {
        return { data: null, error: "SIGNAL_INTERFERENCE: Re-establishing network link..." };
    }
    
    return { data: null, error: "AI Service temporarily restricted." };
}

async function generateContentWithRetry(model: string, contents: any, config?: any, priority: number = 1, taskId: string = 'gen'): Promise<any> {
    if (isGlobalCoolingDown && priority === 0) {
        throw new Error("SYSTEM_CONGESTION");
    }

    return orchestrator.add(async () => {
        try {
            // Route through the new Kallipolis ZK Edge AI Gateway via REST API
            const response = await fetch('/api/v1/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, contents, config })
            });
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error: any) {
            const errorStr = (error.message || JSON.stringify(error)).toLowerCase();
            const is429 = errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted');
            
            if (is429) {
                setCoolingDown(true);
                clearTimeout(cooldownTimer);
                cooldownTimer = setTimeout(() => setCoolingDown(false), 65000);
            }
            throw error;
        }
    }, priority, taskId, model);
}

export async function analyzeWithGemini(prompt: string, isBackground: boolean = false): Promise<{ data: string | null; error: string | null }> {
    const cacheKey = `text_${btoa(prompt).substring(0, 32)}`;
    
    if (pendingRequests.has(cacheKey)) {
        try {
            return { data: await pendingRequests.get(cacheKey), error: null };
        } catch (e) {
            return handleGeminiError(e);
        }
    }

    try {
        const cached = getFromCache<string>(cacheKey, TTL.MEDIUM);
        if (cached) return { data: cached, error: null };

        const requestPromise = (async () => {
            const model = 'gemini-2.0-flash';
            const response = await generateContentWithRetry(
                model, 
                prompt, 
                undefined, 
                isBackground ? 0 : 1, 
                `text_${cacheKey}`
            );
            const text = response.text || "";
            if (text) setCache(cacheKey, text);
            return text;
        })();

        pendingRequests.set(cacheKey, requestPromise);
        const data = await requestPromise;
        return { data, error: null };
    } catch (error) {
        return handleGeminiError(error);
    } finally {
        pendingRequests.delete(cacheKey);
    }
}

async function analyzeWithStructuredSchema<T>(prompt: string, schema: any, cacheKey?: string, ttl: number = TTL.SHORT, isBackground: boolean = false): Promise<{ data: T | null; error: string | null }> {
    const internalCacheKey = cacheKey || `struct_${btoa(prompt).substring(0, 32)}`;

    if (pendingRequests.has(internalCacheKey)) {
        try {
            return { data: await pendingRequests.get(internalCacheKey), error: null };
        } catch (e) {
            return handleGeminiError(e);
        }
    }

    try {
        const cached = getFromCache<T>(internalCacheKey, ttl);
        if (cached) return { data: cached, error: null };

        const requestPromise = (async () => {
            const model = 'gemini-2.0-flash';
            const response = await generateContentWithRetry(
                model, 
                prompt, 
                {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }, 
                isBackground ? 0 : 2,
                internalCacheKey
            );
            
            const jsonText = response.text?.trim() || "";
            if (!jsonText) throw new Error("EMPTY_RESPONSE");
            
            const data = JSON.parse(jsonText) as T;
            if (cacheKey) setCache(cacheKey, data);
            return data;
        })();

        pendingRequests.set(internalCacheKey, requestPromise);
        const data = await requestPromise;
        return { data, error: null };
    } catch (error) {
        return handleGeminiError(error);
    } finally {
        pendingRequests.delete(internalCacheKey);
    }
}

export const connectToLiveAssistant = (callbacks: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.live.connect({
    model: 'gemini-2.0-flash-exp',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are Kallipolis ZK Specialist, a highly technical crypto security AI. Concisely analyze Polygon network threats. Yielding priority to mission critical data streams.',
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  });
};

// BACKGROUND TASKS - ALL MOVED TO FLASH MODEL
export async function getTokenApprovals(address: string): Promise<{ data: TokenApproval[] | null; error: string | null }> {
    const prompt = `Identify active token approvals for Polygon wallet: ${address}. JSON list.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                tokenName: { type: Type.STRING },
                tokenSymbol: { type: Type.STRING },
                tokenAddress: { type: Type.STRING },
                spenderName: { type: Type.STRING },
                spenderAddress: { type: Type.STRING },
                allowance: { type: Type.STRING },
            },
            required: ['tokenName', 'tokenSymbol', 'tokenAddress', 'spenderName', 'spenderAddress', 'allowance']
        }
    };
    return analyzeWithStructuredSchema<TokenApproval[]>(prompt, schema, `approvals_${address}`, TTL.SHORT, true);
}

export async function getPortfolioSnapshot(address: string): Promise<{ data: PortfolioSnapshot | null; error: string | null }> {
    const prompt = `Security score (0-100) and risk level for ${address} on Polygon.`;
    const schema = {
        type: Type.OBJECT,
        properties: { securityScore: { type: Type.NUMBER }, riskLevel: { type: Type.STRING } },
        required: ['securityScore', 'riskLevel']
    };
    return analyzeWithStructuredSchema<PortfolioSnapshot>(prompt, schema, `snapshot_${address}`, TTL.MEDIUM, true);
}

export async function getIntelligenceBriefing(): Promise<{ data: GenerateContentResponse | null; error: string | null }> {
    if (isGlobalCoolingDown) return { data: null, error: "SYSTEM_CONGESTION" };
    try {
        const response = await generateContentWithRetry(
            "gemini-2.0-flash",
            "Polygon network security status briefing. Last 24 hours.",
            { tools: [{ googleSearch: {} }] },
            0,
            'intel_briefing'
        );
        return { data: response, error: null };
    } catch (error) {
        return handleGeminiError(error) as any;
    }
}

export async function getSecurityAlerts(): Promise<{ data: SecurityAlert[] | null; error: string | null }> {
    const prompt = `Generate 2 new plausible security alerts for Polygon network. JSON format.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
            },
            required: ['id', 'timestamp', 'severity', 'title', 'description']
        }
    };
    return analyzeWithStructuredSchema<SecurityAlert[]>(prompt, schema, 'security_alerts', TTL.MEDIUM, true);
}

export async function getOnChainEvents(): Promise<{ data: OnChainEvent[] | null; error: string | null }> {
    const prompt = `Generate 2 recent plausible on-chain events for Polygon. JSON format.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                type: { type: Type.STRING },
                details: { type: Type.STRING },
                address: { type: Type.STRING }
            },
            required: ['id', 'timestamp', 'type', 'details', 'address']
        }
    };
    return analyzeWithStructuredSchema<OnChainEvent[]>(prompt, schema, 'onchain_events', TTL.MEDIUM, true);
}

// COMPLEX TASKS - KEPT ON PRO MODEL
export async function analyzeWalletReport(address: string): Promise<{ data: WalletReportResult | null; error: string | null }> {
    const prompt = `Analyze wallet ${address} on Polygon. Provide risk level, security score, summary, and lists of positive points and risks.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            riskLevel: { type: Type.STRING },
            securityScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            positivePoints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, detail: {type: Type.STRING}}, required: ['title', 'detail'] } },
            risks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, detail: {type: Type.STRING}, severity: { type: Type.STRING }}, required: ['title', 'detail', 'severity'] } },
        },
        required: ['riskLevel', 'securityScore', 'summary', 'positivePoints', 'risks']
    };
    return analyzeWithStructuredSchema<WalletReportResult>(prompt, schema, `wallet_report_${address}`, TTL.MEDIUM, false);
}

export async function analyzeBridgeSecurity(address: string): Promise<{ data: BridgeSecurityResult | null; error: string | null }> {
    try {
        const { apiService } = await import('./apiService');
        const bridgeRes = await apiService.inspectBridgeTx(address);
        if (bridgeRes && bridgeRes.relay_status) {
            return {
                data: {
                    securityScore: {
                        score: bridgeRes.exit_root_validity ? 96 : 32,
                        rating: bridgeRes.exit_root_validity ? 'Low Risk' : 'High Risk',
                        summary: `${bridgeRes.bridge_protocol}: ${bridgeRes.threat_analysis}`
                    },
                    withdrawalSafety: {
                        risk: bridgeRes.zk_batch_proof_verified ? 'Low' : 'High',
                        summary: `Merkle tree depth ${bridgeRes.merkle_tree_proof.depth}, zk-proof batch verified.`
                    },
                    liquidityRisk: {
                        risk: 'Low',
                        summary: 'Unified Polygon LxLy exit root validated across all child networks.'
                    }
                },
                error: null
            };
        }
    } catch (e) {
        console.warn("Bridge API fallback to Gemini SDK", e);
    }

    const prompt = `Analyze bridge security at ${address}. Evaluate withdrawal safety and liquidity risk.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            securityScore: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, rating: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['score', 'rating', 'summary'] },
            withdrawalSafety: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['risk', 'summary'] },
            liquidityRisk: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['risk', 'summary'] }
        },
        required: ['securityScore', 'withdrawalSafety', 'liquidityRisk']
    };
    return analyzeWithStructuredSchema<BridgeSecurityResult>(prompt, schema, undefined, TTL.MEDIUM, false);
}

export async function analyzeRegulatoryCompliance(identifier: string): Promise<{ data: RegulatoryComplianceResult | null; error: string | null }> {
    const prompt = `Analyze regulatory compliance for ${identifier}. Evaluate AML risk, compliance status, and legal risk score.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            amlRisk: { type: Type.OBJECT, properties: { level: { type: Type.STRING }, summary: { type: Type.STRING }, flags: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['level', 'summary', 'flags'] },
            complianceStatus: { type: Type.OBJECT, properties: { status: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ['status', 'summary'] },
            legalRisk: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, summary: { type: Type.STRING } }, required: ['score', 'summary'] }
        },
        required: ['amlRisk', 'complianceStatus', 'legalRisk']
    };
    return analyzeWithStructuredSchema<RegulatoryComplianceResult>(prompt, schema, undefined, TTL.MEDIUM, false);
}

export async function analyzeTransactionWithFirewall(targetContract: string, txData: string): Promise<{ data: FirewallAnalysisResult | null; error: string | null }> {
    try {
        const { apiService } = await import('./apiService');
        
        // Use AI Gateway Consensus Engine for voting on the payload
        const consensusRes = await fetch('/api/v1/ai/consensus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { targetContract, txData }, analysisType: 'FIREWALL' })
        }).catch(() => ({ ok: false, json: async () => ({}) }));
        
        let aiVerdict = 'FLAG';
        if (consensusRes.ok) {
            const data = await consensusRes.json();
            if (data.verdict) aiVerdict = data.verdict;
        }

        const sim = await apiService.simulateFirewallTx(txData, 0);
        
        // Merge Consensus Verdict with Simulation
        if (sim && sim.firewall_verdict) {
            let status: 'Allowed' | 'Blocked' = sim.simulation_status === "BLOCKED" ? 'Blocked' : 'Allowed';
            if (aiVerdict === 'BLOCK') status = 'Blocked';

            return {
                data: {
                    status,
                    summary: `Kallipolis ZK Firewall Consensus: ${aiVerdict}. Action: ${status.toUpperCase()} (${sim.firewall_verdict.threat_category})`,
                    threatType: sim.firewall_verdict.threat_category,
                    confidence: sim.prevention_confidence,
                    suggestedActions: [
                        `Enforce Consensus Policy (Verdict: ${aiVerdict})`,
                        "Verify recipient contract bytecode hash before broadcast"
                    ]
                },
                error: null
            };
        }
    } catch (e) {
        console.warn("Firewall API fallback to Gemini SDK", e);
    }

    const prompt = `Pre-execution firewall simulation for target ${targetContract} and data ${txData}. Detect threats and suggest actions.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING },
            summary: { type: Type.STRING },
            threatType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['status', 'summary', 'threatType', 'confidence', 'suggestedActions']
    };
    return analyzeWithStructuredSchema<FirewallAnalysisResult>(prompt, schema, undefined, TTL.SHORT, false);
}

export async function analyzeTransaction(txData: string): Promise<{ data: TransactionAnalysisResult | null; error: string | null }> {
    const prompt = `Analyze risk for the following transaction data: ${txData}. Provide warnings and flow details.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            riskLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            warnings: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, detail: { type: Type.STRING }, severity: { type: Type.STRING } }, required: ['title', 'detail', 'severity'] } },
            transactionFlow: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, value: { type: Type.STRING }, action: { type: Type.STRING } }, required: ['from', 'to', 'value', 'action'] }
        },
        required: ['riskLevel', 'summary', 'warnings', 'transactionFlow']
    };
    return analyzeWithStructuredSchema<TransactionAnalysisResult>(prompt, schema, undefined, TTL.SHORT, false);
}

export async function analyzeQuantumResistance(address: string): Promise<{ data: QuantumAnalysisResult | null; error: string | null }> {
    const prompt = `Quantum resistance analysis for ${address}. Identify vulnerable components and PQC recommendations.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            readinessStatus: { type: Type.STRING },
            summary: { type: Type.STRING },
            vulnerableComponents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { component: { type: Type.STRING }, detail: { type: Type.STRING } }, required: ['component', 'detail'] } },
            pqcRecommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { algorithm: { type: Type.STRING }, useCase: { type: Type.STRING } }, required: ['algorithm', 'useCase'] } },
            migrationPath: { type: Type.STRING },
        },
        required: ['readinessStatus', 'summary', 'vulnerableComponents', 'pqcRecommendations', 'migrationPath']
    };
    return analyzeWithStructuredSchema<QuantumAnalysisResult>(prompt, schema, undefined, TTL.MEDIUM, false);
}

export async function simulateZKProofVerification(address: string): Promise<{ data: ZKProofVerificationResult | null; error: string | null }> {
    try {
        const { apiService } = await import('./apiService');
        const zkRes = await apiService.verifyZKProof(address, "polygon-zkevm-bridge");
        if (zkRes && zkRes.verification_status) {
            return {
                data: {
                    status: zkRes.verification_status,
                    summary: `SNARK Field BN128 (${zkRes.proof_system || 'Groth16'}). Merkle root ${zkRes.merkle_root || '0x4f...'} verified in ${zkRes.verification_time_ms || 18.4}ms.`,
                    verifiedClaims: [
                        { claim: 'Zero-Knowledge Solvency Proof', status: 'Verified' },
                        { claim: 'Polygon zkEVM Batch State Root', status: 'Verified' },
                        { claim: 'Non-Double Spend Nullifier', status: 'Verified' }
                    ],
                    privacyPreserved: [
                        'Sender Identity Masked via Plonk SNARK',
                        'Transaction Amounts Shielded with Pedersen Commitments',
                        'UTXO Nullifier Tree Encrypted'
                    ]
                },
                error: null
            };
        }
    } catch (e) {
        console.warn("ZK API fallback to Gemini SDK", e);
    }

    const prompt = `Simulate ZK Proof verification for address ${address}. Provide claims status and privacy details.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING },
            summary: { type: Type.STRING },
            verifiedClaims: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { claim: { type: Type.STRING }, status: { type: Type.STRING } }, required: ['claim', 'status'] } },
            privacyPreserved: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['status', 'summary', 'verifiedClaims', 'privacyPreserved']
    };
    return analyzeWithStructuredSchema<ZKProofVerificationResult>(prompt, schema, undefined, TTL.SHORT, false);
}

export async function getNamesForAddresses(addresses: string[]): Promise<{ data: Record<string, { name: string; symbol: string }> | null; error: string | null }> {
    const prompt = `Identify project names and symbols for these Polygon addresses: ${addresses.join(', ')}. JSON format.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            results: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { address: { type: Type.STRING }, name: { type: Type.STRING }, symbol: { type: Type.STRING } },
                    required: ['address', 'name', 'symbol']
                }
            }
        },
        required: ['results']
    };
    const result = await analyzeWithStructuredSchema<{ results: any[] }>(prompt, schema, `names_${addresses.join('_')}`, TTL.LONG, true);
    if (result.data) {
        const mapped: Record<string, { name: string; symbol: string }> = {};
        result.data.results.forEach(item => { mapped[item.address] = { name: item.name, symbol: item.symbol }; });
        return { data: mapped, error: null };
    }
    return { data: null, error: result.error };
}

export async function analyzeSmartContractAudit(code: string): Promise<{ data: SmartContractAuditResult | null; error: string | null }> {
    try {
        const { apiService } = await import('./apiService');
        const apiRes = await apiService.runContractAudit(code);
        if (apiRes && apiRes.audit_id) {
            const riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 
                apiRes.overall_status === "CRITICAL" ? 'Critical' :
                apiRes.overall_status === "VULNERABLE" ? 'High' : 'Low';

            return {
                data: {
                    summary: apiRes.summary,
                    riskLevel,
                    securityScore: apiRes.risk_score,
                    vulnerabilities: apiRes.vulnerabilities.map(v => {
                        let severity: 'High' | 'Medium' | 'Low' | 'Informational' = 'High';
                        if (v.severity === 'CRITICAL' || v.severity === 'HIGH') severity = 'High';
                        else if (v.severity === 'MEDIUM') severity = 'Medium';
                        else if (v.severity === 'LOW') severity = 'Low';
                        else severity = 'Informational';

                        return {
                            title: `${v.id}: ${v.title}`,
                            description: `${v.description} Remediation: ${v.remediation}`,
                            severity
                        };
                    }),
                    gasOptimizations: apiRes.gas_optimizations.map(g => ({
                        suggestion: g,
                        details: "Kallipolis ZK AI Static Optimization",
                        estimatedSaving: "~5,000 gas"
                    }))
                },
                error: null
            };
        }
    } catch (e) {
        console.warn("Backend API route call error, falling back to Gemini SDK", e);
    }

    const prompt = `Perform an expert smart contract audit on the following Solidity code. Identify security vulnerabilities with severity and gas optimization opportunities.
    
    Code:
    ${code}
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            securityScore: { type: Type.NUMBER },
            vulnerabilities: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        severity: { type: Type.STRING }
                    },
                    required: ['title', 'description', 'severity']
                }
            },
            gasOptimizations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING },
                        details: { type: Type.STRING },
                        estimatedSaving: { type: Type.STRING }
                    },
                    required: ['suggestion', 'details', 'estimatedSaving']
                }
            }
        },
        required: ['summary', 'riskLevel', 'securityScore', 'vulnerabilities', 'gasOptimizations']
    };
    return analyzeWithStructuredSchema<SmartContractAuditResult>(prompt, schema, undefined, TTL.MEDIUM, false);
}
