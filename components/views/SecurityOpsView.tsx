
import React from 'react';
import Card from '../common/Card';
import { ActivityIcon, ShieldCheckIcon, ThreatIcon, CpuIcon, ZapIcon } from '../Icons';
import { motion } from 'framer-motion';

const SecurityOpsView: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                        <ActivityIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-white leading-none">Security Operations Center</h1>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">SOC_V3 // Active Countermeasures // Threat Neutralization</p>
                    </div>
                </div>
                <div className="flex gap-3">
                     <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">Defcon_Level: 2</span>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-[#080808] border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <ShieldCheckIcon className="w-24 h-24 text-white" />
                    </div>
                    <h3 className="text-[10px] font-mono text-gray-600 uppercase font-black mb-6">Active_Interceptors</h3>
                    <div className="text-4xl font-mono font-black text-white mb-2">1,402</div>
                    <p className="text-[10px] text-green-500 font-mono uppercase tracking-widest flex items-center gap-2">
                        <ZapIcon className="w-3 h-3" /> All Shield Modules Engaged
                    </p>
                </Card>

                <Card className="p-6 bg-[#080808] border-white/10">
                    <h3 className="text-[10px] font-mono text-gray-600 uppercase font-black mb-6">Neutralized_Payloads_24H</h3>
                    <div className="text-4xl font-mono font-black text-red-500 mb-2">42</div>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Estimated Loss Prevention: $1.2M</p>
                </Card>

                <Card className="p-6 bg-[#080808] border-white/10">
                    <h3 className="text-[10px] font-mono text-gray-600 uppercase font-black mb-6">Kernel_Threat_Score</h3>
                    <div className="text-4xl font-mono font-black text-blue-400 mb-2">8.2<span className="text-lg text-gray-600">/100</span></div>
                    <p className="text-[10px] text-green-500 font-mono uppercase tracking-widest">Network Risk: Nominal</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-8 p-0 bg-[#050505] overflow-hidden border-white/10 h-96 flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase font-mono">Live_Mitigation_Matrix</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-white/5"></div>
                        </div>
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 tech-bg opacity-[0.05]"></div>
                        <div className="relative z-10 text-center max-w-md">
                            <div className="w-20 h-20 border-2 border-dashed border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ThreatIcon className="w-10 h-10 text-red-500 animate-pulse" />
                            </div>
                            <h4 className="text-white font-mono text-xs uppercase tracking-[0.5em] mb-3">Monitoring_Signal_Anomalies</h4>
                            <p className="text-[9px] text-gray-600 font-mono uppercase leading-relaxed">
                                The AI Shield is actively monitoring mempool transitions and ZK-proof generation for outlier signatures...
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-4 p-6 bg-[#080808] border-white/10 h-96 flex flex-col">
                    <h3 className="text-[10px] font-mono text-gray-600 uppercase font-black mb-6">Protocol_Status_Check</h3>
                    <div className="space-y-5 overflow-y-auto custom-scrollbar flex-1 pr-2">
                        {[
                            { n: 'AGGLAYER_V1', s: 'Engaged', h: 100 },
                            { n: 'MEMPOOL_SHIELD', s: 'Operational', h: 98 },
                            { n: 'IDENT_RECON', s: 'Active', h: 100 },
                            { n: 'ZK_PROVER_UNIT', s: 'Syncing', h: 92 },
                            { n: 'ORACLE_UPLINK', s: 'Engaged', h: 100 },
                        ].map((node, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono font-bold text-white uppercase">{node.n}</span>
                                    <span className="text-[8px] font-mono text-blue-400 uppercase">{node.s}</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${node.h}%` }}
                                        className={`h-full ${node.h === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SecurityOpsView;
