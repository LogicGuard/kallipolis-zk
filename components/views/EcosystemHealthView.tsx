
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { GlobeIcon, ActivityIcon, ShieldCheckIcon, CpuIcon, LayersIcon, ZapIcon, TrendingUpIcon } from '../Icons';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';

const NODES = [
  { id: 'pos_core', label: 'Polygon PoS Cluster', type: 'core', x: 400, y: 250, health: 99, load: 42, info: 'Primary settlement layer. 100+ Validators active.' },
  { id: 'zkevm', label: 'zkEVM Prover', type: 'core', x: 400, y: 120, health: 100, load: 18, info: 'Zero-knowledge proof generation unit. Latency: 4ms.' },
  { id: 'agglayer', label: 'AggLayer V1', type: 'infra', x: 400, y: 380, health: 98, load: 12, info: 'Unified state and liquidity orchestration layer.' },
  { id: 'bridge_eth', label: 'L1 Bridge Hub', type: 'infra', x: 650, y: 200, health: 92, load: 75, info: 'High-volume liquidity corridor to Ethereum Mainnet.' },
  { id: 'mempool', label: 'Global Mempool', type: 'infra', x: 150, y: 200, health: 96, load: 55, info: 'Transaction propagation network. Zero congestion.' },
  { id: 'aave', label: 'Aave V3 Protocol', type: 'app', x: 200, y: 350, health: 97, load: 30, info: 'Liquidity market. TVL: $420M+ on Polygon.' },
  { id: 'uniswap', label: 'Uniswap V3', type: 'app', x: 600, y: 350, health: 99, load: 25, info: 'DEX state. Active pairs: 1,400+.' },
  { id: 'open_sea', label: 'Marketplace Relay', type: 'app', x: 700, y: 100, health: 95, load: 60, info: 'NFT trading signals and metadata indexing.' },
];

const CONNECTIONS = [
  { from: 'pos_core', to: 'zkevm' },
  { from: 'pos_core', to: 'agglayer' },
  { from: 'mempool', to: 'pos_core' },
  { from: 'bridge_eth', to: 'pos_core' },
  { from: 'aave', to: 'pos_core' },
  { from: 'uniswap', to: 'pos_core' },
  { from: 'open_sea', to: 'agglayer' },
];

const EcosystemHealthView: React.FC = () => {
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [activeLayers, setActiveLayers] = useState<string[]>(['core', 'infra', 'app']);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const toggleLayer = (layer: string) => {
        setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
    };

    const handleNodeClick = async (node: any) => {
        setSelectedNode(node);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        
        const prompt = `Perform a tactical security and performance audit for the Polygon network node: "${node.label}" (ID: ${node.id}). 
        Context: Health ${node.health}%, Compute Load ${node.load}%. 
        Output a Markdown report including: 1. Node Integrity Score. 2. Potential Attack Vectors. 3. Optimization suggestions. 
        Keep it professional and data-dense.`;
        
        const { data } = await analyzeWithGemini(prompt);
        setAnalysisResult(data);
        setIsAnalyzing(false);
    };

    const visibleNodes = useMemo(() => NODES.filter(n => activeLayers.includes(n.type)), [activeLayers]);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col max-w-[1600px] mx-auto">
            {/* HUD Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                        <GlobeIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-white leading-none">Tactical Topology Matrix</h1>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">Real-Time Infrastructure Visualization // Node-Level Intelligence</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-black/40 p-1 border border-white/5 rounded-sm">
                    {['core', 'infra', 'app'].map(layer => (
                        <button 
                            key={layer}
                            onClick={() => toggleLayer(layer)}
                            className={`px-4 py-2 rounded-sm font-mono text-[9px] font-black uppercase transition-all ${
                                activeLayers.includes(layer) 
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                                : 'text-gray-600 hover:text-gray-400'
                            }`}
                        >
                            Layer_{layer}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* INTERACTIVE MAP AREA */}
                <Card className="lg:col-span-8 p-0 bg-[#020202] border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 tech-bg opacity-10 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none"></div>
                    
                    <svg viewBox="0 0 800 500" className="w-full h-full relative z-10 select-none">
                        {/* Glow Filter */}
                        <defs>
                            <filter id="glow-node">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        </defs>

                        {/* Connection Lines */}
                        {CONNECTIONS.map((conn, i) => {
                            const from = NODES.find(n => n.id === conn.from)!;
                            const to = NODES.find(n => n.id === conn.to)!;
                            if (!activeLayers.includes(from.type) || !activeLayers.includes(to.type)) return null;

                            return (
                                <g key={i}>
                                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
                                    <motion.circle
                                        r="1.5"
                                        fill="#3b82f6"
                                        animate={{
                                            cx: [from.x, to.x],
                                            cy: [from.y, to.y],
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "linear" }}
                                    />
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {visibleNodes.map((node) => (
                            <motion.g 
                                key={node.id}
                                onClick={() => handleNodeClick(node)}
                                className="cursor-pointer group/node"
                                whileHover={{ scale: 1.05 }}
                            >
                                <circle 
                                    cx={node.x} cy={node.y} r="20" 
                                    fill="rgba(0,0,0,0.8)" 
                                    stroke={selectedNode?.id === node.id ? '#3b82f6' : 'rgba(255,255,255,0.05)'} 
                                    strokeWidth="1"
                                />
                                <circle 
                                    cx={node.x} cy={node.y} r="4" 
                                    fill={node.health > 95 ? '#10b981' : node.health > 90 ? '#fbbf24' : '#ef4444'} 
                                    filter="url(#glow-node)" 
                                />
                                <text 
                                    x={node.x} y={node.y + 35} 
                                    textAnchor="middle" 
                                    fill={selectedNode?.id === node.id ? '#fff' : '#555'} 
                                    className="text-[8px] font-mono font-bold uppercase tracking-widest group-hover/node:fill-white transition-colors"
                                >
                                    {node.label}
                                </text>
                            </motion.g>
                        ))}
                    </svg>

                    {/* HUD Status Legend */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2 p-4 bg-black/60 border border-white/5 backdrop-blur-md rounded-sm z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">Nominal_State</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">Congestion_Warn</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">High_Risk_Alert</span>
                        </div>
                    </div>
                </Card>

                {/* SIDEBAR ANALYSIS PANEL */}
                <Card className="lg:col-span-4 p-0 bg-[#080808] flex flex-col h-full overflow-hidden border-white/10">
                    <div className="p-4 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] font-mono">Telemetry_Output</h3>
                        <ActivityIcon className={`w-3.5 h-3.5 ${isAnalyzing ? 'text-blue-500 animate-spin' : 'text-gray-800'}`} />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <AnimatePresence mode="wait">
                            {selectedNode ? (
                                <motion.div 
                                    key={selectedNode.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <div className="text-[8px] font-mono text-blue-500 uppercase font-black mb-1">UID: {selectedNode.id}</div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedNode.label}</h2>
                                        <p className="text-[10px] text-gray-500 font-mono mt-2 uppercase leading-relaxed">{selectedNode.info}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/[0.02] border border-white/5">
                                            <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">Health_Score</div>
                                            <div className="text-xl font-mono font-black text-green-400">{selectedNode.health}%</div>
                                        </div>
                                        <div className="p-3 bg-white/[0.02] border border-white/5">
                                            <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">Current_Load</div>
                                            <div className="text-xl font-mono font-black text-blue-400">{selectedNode.load}%</div>
                                        </div>
                                    </div>

                                    {isAnalyzing ? (
                                        <div className="py-20 text-center space-y-4">
                                            <div className="w-10 h-10 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto"></div>
                                            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest animate-pulse">Scanning_Node_Parameters...</p>
                                        </div>
                                    ) : analysisResult ? (
                                        <ResultDisplay content={analysisResult} />
                                    ) : (
                                        <div className="py-12 border border-dashed border-white/10 text-center opacity-40">
                                            <ShieldCheckIcon className="w-8 h-8 mx-auto mb-3" />
                                            <p className="text-[9px] font-mono uppercase tracking-widest">Execute Scan for Details</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                                    <GlobeIcon className="w-20 h-20 mb-6" />
                                    <h4 className="text-xs font-mono uppercase tracking-[0.4em] text-white">Select_Topology_Unit</h4>
                                    <p className="text-[10px] font-mono text-gray-500 mt-2">Interact with the map to initialize deep node forensics.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {selectedNode && (
                        <div className="p-4 bg-[#050505] border-t border-white/10">
                            <Button onClick={() => handleNodeClick(selectedNode)} className="w-full justify-center py-4 bg-white text-black hover:bg-gray-200 uppercase font-black tracking-widest text-[10px]">
                                RUN_TACTICAL_AUDIT
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default EcosystemHealthView;
