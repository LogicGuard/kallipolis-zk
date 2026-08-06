
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { GlobeIcon, ActivityIcon, ShieldCheckIcon, CpuIcon, ZapIcon } from '../Icons';

const REGIONS = [
    { id: 'US_EAST', name: 'Americas (East)', status: 'Operational', latency: '12ms', load: 42 },
    { id: 'EU_CENTRAL', name: 'Europe (Central)', status: 'Operational', latency: '18ms', load: 38 },
    { id: 'ASIA_SOUTH', name: 'Asia (South)', status: 'Nominal', latency: '44ms', load: 61 },
    { id: 'IND_WEST', name: 'India (Mumbai)', status: 'Operational', latency: '8ms', load: 22 },
];

const NodeHealthView: React.FC = () => {
    const [pulseData, setPulseData] = useState<number[]>(Array.from({ length: 20 }, () => 95 + Math.random() * 5));

    useEffect(() => {
        const interval = setInterval(() => {
            setPulseData(prev => [...prev.slice(1), 95 + Math.random() * 5]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                        <GlobeIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-white leading-none">Global Infrastructure Matrix</h1>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">Node Health // Cluster Uptime // Latency Profiling</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[8px] font-mono text-gray-600 uppercase font-black">Global_Uptime</div>
                        <div className="text-xl font-mono font-black text-green-500">99.998%</div>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="text-right">
                        <div className="text-[8px] font-mono text-gray-600 uppercase font-black">Avg_Latency</div>
                        <div className="text-xl font-mono font-black text-blue-400">14.2ms</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Main Health Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REGIONS.map((region, i) => (
                        <Card key={region.id} className="p-6 bg-[#080808] border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[8px] font-mono text-gray-600 uppercase font-black mb-1">Region_Node</div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{region.name}</h3>
                                </div>
                                <div className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase ${region.status === 'Operational' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    {region.status}
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                <div>
                                    <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Latency</span>
                                    <span className="text-xl font-mono font-black text-white">{region.latency}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Compute_Load</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-mono font-black text-blue-400">{region.load}%</span>
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${region.load}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Card className="md:col-span-2 p-6 bg-black relative overflow-hidden">
                        <div className="absolute inset-0 tech-bg opacity-[0.03]"></div>
                        <div className="relative z-10 flex justify-between items-center mb-6">
                             <div className="flex items-center gap-2">
                                <ZapIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">AggLayer_Sync_Pulse</span>
                             </div>
                             <span className="text-[10px] font-mono text-green-500">SYNCHRONIZED_V1.2</span>
                        </div>
                        <div className="h-32 flex items-end gap-1 px-2 relative z-10">
                            {pulseData.map((val, i) => (
                                <motion.div 
                                    key={i}
                                    className="flex-1 bg-blue-500/30 border-t border-blue-500 rounded-t-sm"
                                    animate={{ height: `${val}%` }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Status Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="flex-1 p-0 bg-[#080808] border-white/10 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Incident_Log</span>
                            <ActivityIcon className="w-4 h-4 text-blue-500 animate-pulse" />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                            {[
                                { t: '14:02:11', e: 'RPC_HANDSHAKE_COMPLETED', s: 'SUCCESS', d: 'Node US-EAST linked to AggLayer.' },
                                { t: '13:58:42', e: 'LATENCY_SPIKE_DETECTED', s: 'WARN', d: 'Asia-South load reached 72% threshold.' },
                                { t: '13:45:00', e: 'HEURISTIC_ENGINE_RELOAD', s: 'SUCCESS', d: 'Gemini v3.1 kernel deployed.' },
                                { t: '12:12:09', e: 'GLOBAL_SYNC_STABLE', s: 'OK', d: 'All 1024 nodes reporting nominal state.' },
                                { t: '11:30:15', e: 'MEMPOOL_PROBE_INIT', s: 'INFO', d: 'Scanning Block #54921025 for vectors.' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 border-b border-white/5 pb-4 last:border-none">
                                    <span className="text-[8px] font-mono text-gray-600 mt-1">{log.t}</span>
                                    <div>
                                        <div className="text-[10px] font-bold text-white uppercase tracking-tighter">{log.e}</div>
                                        <p className="text-[9px] text-gray-500 font-mono mt-1">{log.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-black border-t border-white/5 text-center">
                             <span className="text-[8px] font-mono text-gray-700 uppercase tracking-[0.4em]">Ready_For_Deployment</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NodeHealthView;
