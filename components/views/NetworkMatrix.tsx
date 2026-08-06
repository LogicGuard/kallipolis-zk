
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { GlobeIcon, ActivityIcon, CpuIcon, ShieldCheckIcon } from '../Icons';

const TopologyNode: React.FC<{ 
    x: number, y: number, label: string, status: 'active' | 'warn' | 'alert', isSatellite?: boolean, onHover: () => void, onClick: () => void 
}> = ({ x, y, label, status, isSatellite, onHover, onClick }) => {
    const color = status === 'active' ? '#3b82f6' : status === 'warn' ? '#fbbf24' : '#ef4444';
    const size = isSatellite ? 2.5 : 4;

    return (
        <motion.g 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="cursor-pointer group"
            onMouseEnter={onHover}
            onClick={onClick}
        >
            <circle cx={x} cy={y} r={isSatellite ? 12 : 18} fill="transparent" />
            
            {/* Ambient Pulse */}
            {!isSatellite && (
                <motion.circle 
                    cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="0.5"
                    animate={{ r: [6, 22, 6], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            )}

            {/* Core Node */}
            <circle 
                cx={x} cy={y} r={size} 
                fill={color} 
                className="transition-all duration-300 group-hover:r-[6px]" 
                style={{ filter: `drop-shadow(0 0 10px ${color})` }} 
            />
            
            {/* Outer Geometric Frame (Non-Satellite) */}
            {!isSatellite && (
                <path 
                    d={`M ${x-10} ${y-10} L ${x-6} ${y-10} M ${x+6} ${y-10} L ${x+10} ${y-10} M ${x-10} ${y+10} L ${x-6} ${y+10} M ${x+6} ${y+10} L ${x+10} ${y+10}`}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.5"
                />
            )}
            
            {/* Connection HUD on Hover */}
            <motion.g className="opacity-0 group-hover:opacity-100 transition-opacity">
                <rect x={x + 12} y={y - 20} width="85" height="18" fill="rgba(0,0,0,0.95)" stroke="rgba(59,130,246,0.4)" strokeWidth="0.5" />
                <text x={x + 16} y={y - 8} fill="white" fontSize="5.5" className="font-mono uppercase font-black tracking-widest">{label}</text>
            </motion.g>
        </motion.g>
    );
};

const NetworkMatrix: React.FC = () => {
    const [focusedNode, setFocusedNode] = useState<string | null>("AGGLAYER_CORE");
    const [selectedNodeDetails, setSelectedNodeDetails] = useState<any | null>(null);

    const NODES = useMemo(() => [
        { id: '1', x: 150, y: 150, label: "RPC_PRIMARY", status: 'active' as const, latency: '12ms', block: '62,891,402', tps: 1840 },
        { id: '2', x: 350, y: 220, label: "CDK_CLUSTER_07", status: 'warn' as const, latency: '48ms', block: '62,891,399', tps: 920 },
        { id: '3', x: 550, y: 140, label: "ZK_PROVER_UNIT", status: 'active' as const, latency: '18ms', block: '62,891,402', tps: 2400 },
        { id: '4', x: 250, y: 380, label: "MEMPOOL_RELAY", status: 'active' as const, latency: '9ms', block: '62,891,403', tps: 3100 },
        { id: '5', x: 500, y: 420, label: "BRIDGE_HUB_L1", status: 'alert' as const, latency: '82ms', block: '62,891,380', tps: 450 },
        { id: '6', x: 750, y: 250, label: "AGGLAYER_CORE", status: 'active' as const, latency: '14ms', block: '62,891,403', tps: 4200 },
        // Satellite Nodes
        { id: 's1', x: 780, y: 280, label: "S_UPLINK_01", status: 'active' as const, isSatellite: true, latency: '11ms', block: '62,891,403', tps: 500 },
        { id: 's2', x: 780, y: 220, label: "S_UPLINK_02", status: 'active' as const, isSatellite: true, latency: '15ms', block: '62,891,403', tps: 500 },
        { id: 's3', x: 120, y: 120, label: "S_AUTH_V4", status: 'active' as const, isSatellite: true, latency: '8ms', block: '62,891,403', tps: 800 },
    ], []);

    const CONNECTIONS = [
        { from: '1', to: '4' },
        { from: '4', to: '2' },
        { from: '2', to: '6' },
        { from: '3', to: '6' },
        { from: '5', to: '6' },
        { from: '6', to: 's1' },
        { from: '6', to: 's2' },
    ];

    return (
        // FIX: Removed unsupported 'title' prop from Card component to resolve TypeScript error.
        <Card className="h-full tactical-border p-0 bg-[#020202] relative flex flex-col group overflow-hidden shadow-2xl rounded-none">
            {/* Header Telemetry */}
            <div className="absolute top-14 left-4 z-20 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[7px] font-mono text-blue-500 uppercase font-black">Syncing_Nodes...</span>
                </div>
                <div className="text-[6px] font-mono text-gray-700 uppercase">Packet_Loss: 0.0001%</div>
            </div>

            <div className="flex-1 relative cursor-crosshair overflow-hidden bg-[#030303]">
                {/* Background Grid Layer */}
                <div className="absolute inset-0 opacity-[0.03] tech-bg"></div>
                
                {/* Custom Hex Matrix Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.05]" width="100%" height="100%">
                    <defs>
                        <pattern id="hex-matrix" width="50" height="43" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                            <path d="M25 0 L50 14.4 L50 43.2 L25 57.6 L0 43.2 L0 14.4 Z" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hex-matrix)" />
                </svg>

                {/* Dynamic Radar Sweep */}
                <motion.div 
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />

                {/* Main Topology Graph */}
                <svg width="100%" height="100%" className="relative z-10" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <linearGradient id="stream-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Active Link Streamers */}
                    {CONNECTIONS.map((conn, i) => {
                        const fromNode = NODES.find(n => n.id === conn.from)!;
                        const toNode = NODES.find(n => n.id === conn.to)!;
                        return (
                            <g key={i}>
                                <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                <motion.circle r="1" fill="#3b82f6">
                                    <animateMotion 
                                        dur={`${3 + i * 0.5}s`} 
                                        repeatCount="indefinite" 
                                        path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`} 
                                    />
                                </motion.circle>
                            </g>
                        );
                    })}

                    {NODES.map(node => (
                        <TopologyNode 
                            key={node.id} 
                            {...node} 
                            onHover={() => setFocusedNode(node.label)} 
                            onClick={() => setSelectedNodeDetails(node)}
                        />
                    ))}

                    {/* Tactical Reticle */}
                    {focusedNode && (
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none">
                            {(() => {
                                const node = NODES.find(n => n.label === focusedNode);
                                if (!node) return null;
                                return (
                                    <g transform={`translate(${node.x}, ${node.y})`}>
                                        <motion.circle r="25" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="5 5" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
                                        <motion.path 
                                            d="M -35 0 L -30 0 M 35 0 L 30 0 M 0 -35 L 0 -30 M 0 35 L 0 30" 
                                            stroke="#3b82f6" strokeWidth="1"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </g>
                                );
                            })()}
                        </motion.g>
                    )}
                </svg>

                {/* Floating Intelligence Node */}
                <div className="absolute bottom-6 right-6 p-4 bg-black/80 border border-white/10 backdrop-blur-xl rounded-none shadow-2xl flex flex-col gap-2 min-w-[180px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <CpuIcon className="w-3 h-3 text-blue-500" />
                             <span className="text-[7px] font-mono text-gray-500 uppercase font-black">Focus_Subject</span>
                        </div>
                        <span className="text-[6px] font-mono text-blue-400">SIG_771</span>
                    </div>
                    <div className="text-sm font-mono text-white font-black tracking-widest uppercase">
                        {focusedNode || "SCANNING..."}
                    </div>
                    <div className="h-0.5 bg-white/5 w-full mt-1">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: focusedNode ? '98%' : '10%' }}
                            className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" 
                        />
                    </div>
                </div>
            </div>
            
            <div className="p-2 border-t border-white/5 bg-black/90 backdrop-blur-md flex justify-between items-center text-[7px] font-mono text-gray-700 uppercase tracking-widest">
                 <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="w-2.5 h-2.5 text-blue-500" />
                    State: NOMINAL // AGGLAYER_UPLINK_VERIFIED
                 </div>
                 <span>P_SIG: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
            </div>

            {/* NODE TELEMETRY MODAL */}
            <AnimatePresence>
                {selectedNodeDetails && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <CpuIcon className="w-5 h-5 text-blue-400" />
                                <div>
                                    <h3 className="text-sm font-mono font-black text-white tracking-widest uppercase">
                                        {selectedNodeDetails.label}
                                    </h3>
                                    <span className="text-[9px] font-mono text-gray-400 uppercase">
                                        Node ID: #{selectedNodeDetails.id} // Polygon Topology
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedNodeDetails(null)}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[9px] font-mono font-black uppercase"
                            >
                                CLOSE [ESC]
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-4">
                            <div className="p-3 bg-white/[0.02] border border-white/5 space-y-1">
                                <span className="text-[8px] font-mono text-gray-500 uppercase font-black">Latency P99</span>
                                <div className="text-lg font-mono font-black text-blue-400">{selectedNodeDetails.latency}</div>
                            </div>
                            <div className="p-3 bg-white/[0.02] border border-white/5 space-y-1">
                                <span className="text-[8px] font-mono text-gray-500 uppercase font-black">Current Throughput</span>
                                <div className="text-lg font-mono font-black text-emerald-400">{selectedNodeDetails.tps} TPS</div>
                            </div>
                            <div className="p-3 bg-white/[0.02] border border-white/5 space-y-1">
                                <span className="text-[8px] font-mono text-gray-500 uppercase font-black">Block Height</span>
                                <div className="text-sm font-mono font-black text-white">#{selectedNodeDetails.block}</div>
                            </div>
                            <div className="p-3 bg-white/[0.02] border border-white/5 space-y-1">
                                <span className="text-[8px] font-mono text-gray-500 uppercase font-black">Consensus Health</span>
                                <div className="text-sm font-mono font-black text-emerald-400">100% VALIDATED</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/10">
                            <span className="text-[8px] font-mono text-gray-500 uppercase">ZK Batch Settlement: OPTIMAL</span>
                            <button 
                                onClick={() => {
                                    alert(`Triggering live RPC ping to ${selectedNodeDetails.label}... Connection verified.`);
                                    setSelectedNodeDetails(null);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                                Ping RPC Endpoint
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default NetworkMatrix;