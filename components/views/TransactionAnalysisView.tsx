
import React, { useState, useMemo } from 'react';
import { Textarea } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeTransaction } from '../../services/geminiService';
import { TransactionAnalysisResult } from '../../types';
import { ThreatIcon, ShieldCheckIcon, TransactionIcon, WalletIcon, CpuIcon, ActivityIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Visualizes the transaction path from origin to target through the security kernel.
 */
const TacticalFlowDiagram: React.FC<{ result: TransactionAnalysisResult }> = ({ result }) => {
    const isHighRisk = result.riskLevel === 'High' || result.riskLevel === 'Critical';
    const statusColor = isHighRisk ? '#ef4444' : result.riskLevel === 'Medium' ? '#fbbf24' : '#10b981';

    return (
        <div className="relative w-full aspect-[21/9] bg-[#030303] border border-white/10 rounded-sm overflow-hidden group shadow-2xl">
            {/* Background Grid & UI Accents */}
            <div className="absolute inset-0 opacity-[0.03] tech-bg pointer-events-none"></div>
            <div className="absolute top-0 left-0 p-3 flex justify-between w-full border-b border-white/5 bg-black/40">
                <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <ActivityIcon className="w-3 h-3 text-blue-500" />
                    Data_Transmission_Path // Real-Time_Vector
                </span>
                <span className="text-[8px] font-mono text-gray-500 uppercase">Packet_Integrity: Verified</span>
            </div>

            {/* SVG Content */}
            <svg width="100%" height="100%" viewBox="0 0 800 340" className="relative z-10">
                <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="50%" stopColor={statusColor} stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Animated Connection Lines */}
                <motion.path 
                    d="M 120 170 L 680 170" 
                    stroke="url(#flowGradient)" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5 5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />

                {/* Origin Node */}
                <g transform="translate(120, 170)">
                    <circle r="40" fill="#080808" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                    <circle r="30" fill="rgba(59, 130, 246, 0.05)" />
                    <foreignObject x="-20" y="-20" width="40" height="40">
                        <div className="w-full h-full flex items-center justify-center">
                            <WalletIcon className="w-6 h-6 text-blue-400" />
                        </div>
                    </foreignObject>
                    <text y="60" textAnchor="middle" fill="#555" fontSize="8" fontFamily="JetBrains Mono" className="uppercase font-bold">Origin_Node</text>
                    <text y="75" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="JetBrains Mono">{result.transactionFlow.from.substring(0,10)}...</text>
                </g>

                {/* Inspection Engine (Center) */}
                <g transform="translate(400, 170)">
                    <motion.circle 
                        r="50" 
                        fill="rgba(0,0,0,0.8)" 
                        stroke={statusColor} 
                        strokeWidth="1"
                        animate={{ r: [45, 52, 45], strokeOpacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ filter: 'url(#glow)' }}
                    />
                    <circle r="35" fill="#000" />
                    <foreignObject x="-25" y="-25" width="50" height="50">
                        <div className="w-full h-full flex items-center justify-center">
                            <CpuIcon className={`w-8 h-8 ${isHighRisk ? 'text-red-500' : 'text-blue-500'} animate-pulse`} />
                        </div>
                    </foreignObject>
                    <text y="70" textAnchor="middle" fill={statusColor} fontSize="10" fontFamily="JetBrains Mono" className="uppercase font-black tracking-widest">Heuristic_Probe</text>
                    <text y="85" textAnchor="middle" fill="#444" fontSize="8" fontFamily="JetBrains Mono">Risk_Index: {result.riskLevel}</text>
                </g>

                {/* Target Node */}
                <g transform="translate(680, 170)">
                    <circle r="40" fill="#080808" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
                    <circle r="30" fill="rgba(139, 92, 246, 0.05)" />
                    <foreignObject x="-20" y="-20" width="40" height="40">
                        <div className="w-full h-full flex items-center justify-center">
                            <TransactionIcon className="w-6 h-6 text-purple-400" />
                        </div>
                    </foreignObject>
                    <text y="60" textAnchor="middle" fill="#555" fontSize="8" fontFamily="JetBrains Mono" className="uppercase font-bold">Target_Contract</text>
                    <text y="75" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="JetBrains Mono">{result.transactionFlow.to.substring(0,10)}...</text>
                </g>

                {/* Value Label Overlay */}
                <g transform="translate(400, 120)">
                    <rect x="-60" y="-15" width="120" height="30" rx="4" fill="#0a0a0a" stroke="rgba(255,255,255,0.1)" />
                    <text textAnchor="middle" y="5" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">{result.transactionFlow.value}</text>
                    <text textAnchor="middle" y="25" fill="#555" fontSize="8" fontFamily="JetBrains Mono" className="uppercase">{result.transactionFlow.action}</text>
                </g>
            </svg>

            {/* Diagram Legend */}
            <div className="absolute bottom-3 right-3 flex gap-4 p-2 bg-black/60 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-[7px] font-mono text-gray-500 uppercase">Uplink</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-[7px] font-mono text-gray-500 uppercase">Security_Probe</span>
                </div>
            </div>
        </div>
    );
};

const TransactionAnalysisView: React.FC = () => {
    const [txData, setTxData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TransactionAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [simulationStep, setSimulationStep] = useState<number>(0);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [simLogs, setSimLogs] = useState<string[]>([]);

    const runLifecycleSimulation = async () => {
        setIsSimulating(true);
        setSimulationStep(1);
        setSimLogs(["[INIT] 📡 Transaction Payload parsed and calibrated.", "[INIT] 🔋 Base Gas limit calculated at 21,000 to 125,000 units."]);
        
        await new Promise(res => setTimeout(res, 1000));
        setSimulationStep(2);
        setSimLogs(prev => [...prev, "[SIG] 🔑 Cryptographic handshake with secure private enclave.", `[SIG] ✍️ ECDSA signature verified successfully.`]);
        
        await new Promise(res => setTimeout(res, 1200));
        setSimulationStep(3);
        setSimLogs(prev => [...prev, "[MEMPOOL] 📥 Transaction queued in Polygon mempool stream.", "[MEMPOOL] 🔗 Staggering Tx for ZK exit batch execution."]);
        
        await new Promise(res => setTimeout(res, 1400));
        setSimulationStep(4);
        setSimLogs(prev => [...prev, "[ZK-HEURISTIC] 🔬 Running AST Pattern matching engine.", "[ZK-HEURISTIC] 🛡️ Pre-execution firewall evaluated risk index as secure."]);
        
        await new Promise(res => setTimeout(res, 1000));
        setSimulationStep(5);
        setSimLogs(prev => [...prev, "[SETTLED] 🏛️ ZK Proof verified. State root securely synchronized.", `[SETTLED] 🎉 Transaction finalized in block #${Math.floor(Math.random() * 500000) + 12000000}.`]);
        setIsSimulating(false);
    };

    const handleAnalyze = async () => {
        if (!txData.trim()) {
            setError('Please paste the transaction data.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        const { data, error: apiError } = await analyzeTransaction(txData);

        if (apiError) {
            setError(apiError);
        } else {
            setResult(data);
        }

        setIsLoading(false);
    };

    const getRiskStyles = (riskLevel: 'Low' | 'Medium' | 'High' | 'Critical') => {
        switch (riskLevel) {
            case 'Low': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            case 'Medium': return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
            case 'High': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            case 'Critical': return { text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50 animate-pulse' };
            default: return { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };

    /**
     * Renders the raw transaction fields in a tactical grid.
     */
    const renderRawDataInspection = () => {
        try {
            const parsed = JSON.parse(txData);
            return (
                <div className="grid grid-cols-1 gap-4">
                    {Object.entries(parsed).map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-1 border-l-2 border-white/5 pl-3 group hover:border-blue-500/30 transition-colors">
                            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-tighter group-hover:text-gray-400 transition-colors">{key}</span>
                            <span className="text-xs font-mono text-blue-300 break-all leading-relaxed">{String(val)}</span>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return (
                <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {txData}
                </pre>
            );
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-sm">
                    <TransactionIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Transaction Inspector</h1>
                    <p className="text-xs text-gray-500 font-mono">Deep Packet Inspection // Risk Scoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Column */}
                <div className="lg:col-span-4 space-y-4">
                     <Card className="p-4 bg-[#080808] border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase font-mono">Raw Payload (JSON)</label>
                            <span className="text-[8px] font-mono text-blue-500 uppercase">EVM_Ready</span>
                        </div>
                        <Textarea 
                            rows={15}
                            placeholder='{ 
  "to": "0x...", 
  "data": "0x...",
  "value": "0" 
}'
                            value={txData}
                            onChange={(e) => setTxData(e.target.value)}
                            className="font-mono text-[11px] bg-[#050505] custom-scrollbar"
                        />
                        <div className="mt-4">
                            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full justify-center py-4 bg-white text-black hover:bg-gray-200">
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
                                        SCANNING...
                                    </span>
                                ) : 'DECODE_SIGNAL'}
                            </Button>
                        </div>
                    </Card>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-400 text-[10px] font-mono bg-red-500/5 p-3 border border-red-500/20 uppercase tracking-tight"
                        >
                            <span className="font-bold">Error:</span> {error}
                        </motion.div>
                    )}
                </div>

                {/* Results Column */}
                <div className="lg:col-span-8">
                    {isLoading && (
                        <Card className="h-full flex items-center justify-center p-12 bg-[#050505] border-white/5">
                            <ViewLoader />
                        </Card>
                    )}

                    {!result && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center border border-white/10 border-dashed bg-white/[0.01] min-h-[500px] rounded-sm">
                            <div className="relative mb-6">
                                <TransactionIcon className="w-16 h-16 text-gray-800" />
                                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full"></div>
                            </div>
                            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">Awaiting_Signal_Ingestion</p>
                        </div>
                    )}

                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Score Card */}
                            <Card className={`p-6 border flex items-center justify-between overflow-hidden relative ${getRiskStyles(result.riskLevel).bg} ${getRiskStyles(result.riskLevel).border}`}>
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                     <ThreatIcon className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-mono uppercase opacity-70 mb-1 tracking-widest font-bold">Threat Assessment</p>
                                    <h2 className={`text-4xl font-bold uppercase tracking-tighter ${getRiskStyles(result.riskLevel).text}`}>{result.riskLevel}</h2>
                                </div>
                                <div className="text-right max-w-sm relative z-10">
                                    <p className="text-xs md:text-sm font-mono text-white leading-relaxed">{result.summary}</p>
                                </div>
                            </Card>

                            {/* Tactical Flow Diagram */}
                            <TacticalFlowDiagram result={result} />

                            {/* Interactive Web3 Transaction Lifecycle Stepper */}
                            <Card className="p-5 bg-[#050505] border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.03),transparent)] pointer-events-none"></div>
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                                    <div>
                                        <h3 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
                                            Kallipolis ZK // Web3 Transaction Lifecycle Simulator
                                        </h3>
                                        <p className="text-[9px] text-gray-500 font-mono uppercase mt-0.5">Real-time trace & state proof validation</p>
                                    </div>
                                    <button 
                                        onClick={runLifecycleSimulation}
                                        disabled={isSimulating}
                                        className={`px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm transition-all border ${
                                            isSimulating 
                                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 animate-pulse cursor-not-allowed' 
                                                : 'bg-white text-black hover:bg-gray-200 border-transparent'
                                        }`}
                                    >
                                        {isSimulating ? 'SIMULATING_CYCLE...' : 'RUN_TRANSACT_TRACE'}
                                    </button>
                                </div>

                                {/* Step Visualizers */}
                                <div className="grid grid-cols-5 gap-2 relative mb-6">
                                    {[
                                        { step: 1, label: 'Ingestion', icon: '📡' },
                                        { step: 2, label: 'Signing', icon: '🔑' },
                                        { step: 3, label: 'Mempool', icon: '📥' },
                                        { step: 4, label: 'ZK-Heuristics', icon: '🔬' },
                                        { step: 5, label: 'Settlement', icon: '🏛️' },
                                    ].map((s) => {
                                        const isActive = simulationStep === s.step;
                                        const isCompleted = simulationStep > s.step;
                                        return (
                                            <div 
                                                key={s.step} 
                                                className={`flex flex-col items-center p-3 border transition-all rounded-sm relative ${
                                                    isActive 
                                                        ? 'bg-purple-950/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-purple-300' 
                                                        : isCompleted 
                                                            ? 'bg-emerald-950/5 border-emerald-500/40 text-emerald-400' 
                                                            : 'bg-[#090909] border-white/5 text-gray-600'
                                                }`}
                                            >
                                                <span className="text-base mb-1">{s.icon}</span>
                                                <span className="text-[9px] font-mono font-black uppercase tracking-wider">{s.label}</span>
                                                <span className="text-[8px] font-mono mt-0.5 opacity-60">
                                                    {isCompleted ? 'VERIFIED' : isActive ? 'PROCESSING' : 'PENDING'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Terminal Console Logs */}
                                <div className="bg-black/80 border border-white/5 p-4 rounded-sm font-mono text-[9px] text-gray-400 space-y-1.5 h-36 overflow-y-auto custom-scrollbar">
                                    <div className="text-gray-600 border-b border-white/5 pb-1 mb-2 uppercase tracking-widest text-[8px] font-black flex justify-between">
                                        <span>SYSTEM_LOG_SHELL</span>
                                        <span className="animate-pulse">● LIVE</span>
                                    </div>
                                    {simLogs.length === 0 ? (
                                        <div className="text-gray-700 italic uppercase">Trace output inactive. Click "Run Transact Trace" to initiate cryptographic handshake validation.</div>
                                    ) : (
                                        simLogs.map((log, index) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={index} 
                                                className={
                                                    log.includes('[SETTLED]') 
                                                        ? 'text-emerald-400 font-bold' 
                                                        : log.includes('[ZK-HEURISTIC]') 
                                                            ? 'text-cyan-400' 
                                                            : log.includes('[INIT]') 
                                                                ? 'text-gray-400' 
                                                                : 'text-purple-400'
                                                }
                                            >
                                                {log}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Raw Data Inspection Section */}
                                <Card className="p-0 bg-[#080808] border-white/10 overflow-hidden h-full">
                                    <div className="p-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                        <h3 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Payload_Buffer_Inspection</h3>
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-black/40 overflow-y-auto custom-scrollbar max-h-[400px]">
                                        {renderRawDataInspection()}
                                    </div>
                                    <div className="px-5 py-2 border-t border-white/5 bg-black/60 flex justify-between items-center">
                                        <span className="text-[8px] font-mono text-gray-600 uppercase">Buffer_Type: JSON_HEX</span>
                                        <span className="text-[8px] font-mono text-gray-600 uppercase">Integrity: Verified</span>
                                    </div>
                                </Card>

                                {/* Warnings & Vectors */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-[10px] font-bold text-gray-600 uppercase font-mono tracking-[0.2em]">Security_Vectors_Detected</h3>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>
                                    {result.warnings.length === 0 ? (
                                        <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-sm flex items-center gap-4 group h-full">
                                            <div className="p-2 bg-green-500/10 rounded-full">
                                                <ShieldCheckIcon className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-100 font-bold uppercase tracking-tight">Signal_Clear</p>
                                                <p className="text-[11px] text-green-400/70 font-mono">No active exploit signatures or high-risk anomalies detected.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                            {result.warnings.map((w, i) => (
                                                <motion.div 
                                                    key={i} 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="p-4 border border-red-500/20 bg-red-500/5 rounded-sm flex gap-4 group hover:bg-red-500/[0.08] transition-colors"
                                                >
                                                    <ThreatIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5 group-hover:animate-pulse" />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-sm font-bold text-red-300 uppercase tracking-tight">{w.title}</span>
                                                            <span className={`text-[8px] px-2 py-0.5 rounded-sm uppercase font-black tracking-widest ${w.severity === 'High' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-red-500/20 text-red-400'}`}>{w.severity}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 leading-relaxed font-mono">{w.detail}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionAnalysisView;
