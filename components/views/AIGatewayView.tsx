import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { SettingsIcon, CpuIcon, ActivityIcon, ShieldCheckIcon, ZapIcon, GlobeIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { GatewayConfig, ProviderType, RoutingStrategy } from '../../services/kallipolisGateway';

const AIGatewayView: React.FC = () => {
    const [config, setConfig] = useState<GatewayConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    
    // Simulated metrics
    const [metrics, setMetrics] = useState({
        totalRequests: 14205,
        cacheHits: 4820,
        slmRouted: 8900,
        costSavedUsd: 14.50
    });

    useEffect(() => {
        // Fetch config from backend
        fetch('/api/v1/models/config')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch gateway config", err);
                setLoading(false);
            });
            
        const interval = setInterval(() => {
            setMetrics(prev => ({
                totalRequests: prev.totalRequests + Math.floor(Math.random() * 5),
                cacheHits: prev.cacheHits + (Math.random() > 0.5 ? 1 : 0),
                slmRouted: prev.slmRouted + (Math.random() > 0.3 ? 1 : 0),
                costSavedUsd: prev.costSavedUsd + (Math.random() * 0.01)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = async () => {
        if (!config) return;
        try {
            await fetch('/api/v1/models/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save", e);
        }
    };

    const updateProviderKey = (provider: ProviderType, key: 'apiKey' | 'baseUrl', value: string) => {
        setConfig(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                providers: {
                    ...prev.providers,
                    [provider]: { ...prev.providers[provider], [key]: value }
                }
            };
        });
    };

    const updateRouting = (routeType: keyof GatewayConfig['routing'], provider: ProviderType) => {
        setConfig(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                routing: {
                    ...prev.routing,
                    [routeType]: provider
                }
            };
        });
    };

    if (loading || !config) return <div className="text-white p-6">Loading Gateway Configuration...</div>;

    const cacheHitRate = ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(1);
    const slmRate = ((metrics.slmRouted / metrics.totalRequests) * 100).toFixed(1);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <CpuIcon className="w-6 h-6 text-blue-500" />
                        Kallipolis ZK Edge AI Gateway
                    </h1>
                    <p className="text-gray-400 mt-1 font-mono text-xs">Unified Model Router, Cache & Cost Management</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-mono text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2"
                >
                    {saved ? 'Saved!' : 'Save Configuration'}
                </button>
            </div>
            
            {/* Live Metrics Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#050505] border border-white/10 p-4">
                    <div className="text-[10px] text-gray-500 font-bold font-mono uppercase mb-1">Total Requests</div>
                    <div className="text-xl text-white font-mono">{metrics.totalRequests.toLocaleString()}</div>
                </div>
                <div className="bg-[#050505] border border-emerald-500/20 p-4">
                    <div className="text-[10px] text-emerald-500 font-bold font-mono uppercase mb-1">Semantic Cache Hit Rate</div>
                    <div className="text-xl text-emerald-400 font-mono">{cacheHitRate}%</div>
                </div>
                <div className="bg-[#050505] border border-purple-500/20 p-4">
                    <div className="text-[10px] text-purple-500 font-bold font-mono uppercase mb-1">SLM Offload Rate</div>
                    <div className="text-xl text-purple-400 font-mono">{slmRate}%</div>
                </div>
                <div className="bg-[#050505] border border-blue-500/20 p-4">
                    <div className="text-[10px] text-blue-500 font-bold font-mono uppercase mb-1">Estimated Cost Saved</div>
                    <div className="text-xl text-blue-400 font-mono">${metrics.costSavedUsd.toFixed(2)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="tactical-border p-6 bg-[#080808]/50">
                    <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-emerald-500" />
                        Provider Configuration
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Gemini Config */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block">Google Gemini (Cloud)</label>
                            <input 
                                type="password" 
                                placeholder="GEMINI_API_KEY"
                                value={config.providers.GEMINI?.apiKey || ''}
                                onChange={(e) => updateProviderKey('GEMINI', 'apiKey', e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        {/* OpenAI Config */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block">OpenAI (Cloud)</label>
                            <input 
                                type="password" 
                                placeholder="OPENAI_API_KEY"
                                value={config.providers.OPENAI?.apiKey || ''}
                                onChange={(e) => updateProviderKey('OPENAI', 'apiKey', e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        {/* Ollama Config */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block">Ollama (Local SLM)</label>
                            <input 
                                type="text" 
                                placeholder="http://localhost:11434/v1"
                                value={config.providers.OLLAMA?.baseUrl || ''}
                                onChange={(e) => updateProviderKey('OLLAMA', 'baseUrl', e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                            <p className="text-[10px] text-gray-600 font-mono mt-1">Zero-cost execution for sensitive and low-latency tasks.</p>
                        </div>
                    </div>
                </Card>

                <Card className="tactical-border p-6 bg-[#080808]/50">
                    <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ActivityIcon className="w-4 h-4 text-purple-500" />
                        Intelligent Routing Rules
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-2 border-b border-white/5 pb-4">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block">Active Global Strategy</label>
                            <select 
                                value={config.strategy}
                                onChange={(e) => setConfig({ ...config, strategy: e.target.value as RoutingStrategy })}
                                className="w-full bg-[#050505] border border-white/10 p-2.5 text-sm font-mono text-blue-400 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                            >
                                <option value="balanced">Balanced (Consensus Voting)</option>
                                <option value="cost">Cost Optimized (Prefers SLM Edge)</option>
                                <option value="fast">Speed Optimized (Prefers Flash / Edge)</option>
                                <option value="quality">Quality Optimized (Prefers Pro / Cloud)</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-wider">Strategy Mappings</h3>
                            {(['cost', 'fast', 'quality', 'balanced'] as const).map(route => (
                                <div key={route} className="flex items-center justify-between">
                                    <span className="text-sm font-mono text-gray-400 capitalize">{route} intent:</span>
                                    <select 
                                        value={config.routing[route]}
                                        onChange={(e) => updateRouting(route, e.target.value as ProviderType)}
                                        className="bg-[#050505] border border-white/10 p-1.5 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                                    >
                                        <option value="GEMINI">Google Gemini</option>
                                        <option value="OPENAI">OpenAI</option>
                                        <option value="OLLAMA">Ollama (Edge SLM)</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 p-4 border border-purple-500/20 bg-purple-500/5 rounded-sm">
                            <h4 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-2">Architectural Guardrails</h4>
                            <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                                Failover Router automatically cascades requests if a primary model fails. Consensus Engine utilizes multiple providers simultaneously for high-assurance tasks like MEV shielding.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AIGatewayView;
