
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreatIcon, AuditorIcon, GlobeIcon, ShieldCheckIcon, ActivityIcon, LayersIcon } from '../Icons';

const FEATURES = [
    {
        id: 'intel',
        title: 'Threat Intelligence',
        subtitle: 'Global Surveillance',
        icon: GlobeIcon,
        description: 'Aggregate and analyze cross-chain signals to preemptively identify malicious actors before they strike using Polygon AggLayer telemetry.',
        stats: [
            { label: 'Active Threats', value: '24' },
            { label: 'Nodes Monitored', value: '1,024' },
        ],
        mock: (
            <div className="h-full flex flex-col justify-between p-4 bg-[#080808] relative overflow-hidden">
                <div className="absolute inset-0 border-[0.5px] border-white/5 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
                    {[...Array(36)].map((_, i) => <div key={i} className="border-[0.5px] border-white/10"></div>)}
                </div>
                <div className="relative z-10 flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2 text-xs font-mono text-polygon-purple-light">
                        <div className="w-2 h-2 bg-polygon-purple rounded-full animate-ping"></div>
                        LIVE_AGGLAYER_FEED
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">NODE_CLUSTER: 0x7b3...e4</div>
                </div>
                <div className="relative z-10 space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white/5 border-l-2 border-polygon-purple">
                            <span className="text-xs text-gray-300 font-mono">0x8a...3f{i}</span>
                            <span className="text-[10px] text-polygon-purple-light bg-polygon-purple/10 px-1 font-bold">SIGNAL_DETECTED</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: 'audit',
        title: 'Algorithmic Auditing',
        subtitle: 'Automated Code Review',
        icon: AuditorIcon,
        description: 'Instantaneous static analysis and formal verification of Solidity contracts using fine-tuned Gemini kernels.',
        stats: [
            { label: 'Vulns Found', value: '12' },
            { label: 'Gas Saved', value: '24%' },
        ],
        mock: (
            <div className="h-full bg-[#0A0A0A] p-4 font-mono text-[10px] text-gray-400 relative">
                <div className="absolute top-0 right-0 p-2 text-green-500 flex gap-2">
                    <span className="font-bold">STATUS: SECURE</span>
                    <ShieldCheckIcon className="w-3 h-3" />
                </div>
                <div className="space-y-1 mt-4">
                    <p><span className="text-polygon-purple-light">function</span> <span className="text-white">authorize</span>(address _node) <span className="text-polygon-purple-light">public</span> &#123;</p>
                    <p className="pl-4 text-gray-600 font-bold">// Analysis: Reentrancy Guard Verified</p>
                    <p className="pl-4">require(nodes[_node].active == <span className="text-polygon-purple-light">true</span>);</p>
                    <p className="pl-4">emit NodeAuthorized(_node);</p>
                    <p>&#125;</p>
                </div>
                <div className="mt-4 border-t border-white/10 pt-2 flex justify-between text-gray-600 font-bold">
                    <span>Complexity: O(1)</span>
                    <span>Risk: Low</span>
                </div>
            </div>
        )
    },
    {
        id: 'assets',
        title: 'Asset Reconnaissance',
        subtitle: 'Portfolio Forensics',
        icon: LayersIcon,
        description: 'Deep-dive analytics into wallet structures, token distribution, and zk-proof compliance exposure.',
        stats: [
            { label: 'Net Worth', value: '$1.2M' },
            { label: 'Risk Score', value: '92/100' },
        ],
        mock: (
            <div className="h-full bg-[#080808] p-4 flex flex-col justify-end relative">
                 <div className="absolute inset-x-0 bottom-0 h-32 flex items-end gap-1 px-4 opacity-50">
                    {[40, 70, 50, 90, 60, 80, 40, 60].map((h, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05 }}
                            className="flex-1 bg-polygon-purple/20 border-t border-polygon-purple"
                        />
                    ))}
                 </div>
                 <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase font-black font-mono">Allocation</div>
                        <div className="text-xl text-white font-mono font-bold tracking-tighter">POLYGON_STAKING</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase font-black font-mono">Health</div>
                        <div className="text-xl text-polygon-purple-light font-mono font-bold">1.82</div>
                    </div>
                 </div>
            </div>
        )
    }
];

const FeatureShowcase: React.FC = () => {
    const [selected, setSelected] = useState(0);

    return (
        <section className="py-24 px-6 bg-[#030303] border-y border-white/5 relative">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-8">
                    <div>
                        <div className="inline-block px-3 py-1 bg-polygon-purple/10 border border-polygon-purple/20 rounded-sm mb-4">
                            <span className="text-[9px] font-mono text-polygon-purple-light uppercase tracking-widest font-black">Core_Capabilities</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">Modular <span className="text-polygon-purple">Defense</span> Primitives</h2>
                    </div>
                    <div className="hidden md:flex gap-4 text-[10px] font-mono text-gray-600 font-bold uppercase tracking-widest">
                        <span>SYS_STATUS: ONLINE</span>
                        <span>UPTIME: 99.99%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 flex flex-col gap-3">
                        {FEATURES.map((feature, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelected(idx)}
                                className={`group flex flex-col p-6 border transition-all duration-500 text-left relative overflow-hidden rounded-none ${
                                    selected === idx 
                                    ? 'bg-white/[0.03] border-polygon-purple/50 shadow-[0_0_30px_rgba(123,63,228,0.1)]' 
                                    : 'bg-transparent border-white/5 hover:border-white/20'
                                }`}
                            >
                                {selected === idx && <div className="absolute left-0 top-0 bottom-0 w-1 bg-polygon-purple"></div>}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-mono uppercase tracking-[0.2em] font-black ${selected === idx ? 'text-polygon-purple-light' : 'text-gray-600'}`}>
                                        SEC_PRIME_0{idx + 1}
                                    </span>
                                    <feature.icon className={`w-5 h-5 ${selected === idx ? 'text-white' : 'text-gray-600'}`} />
                                </div>
                                <h3 className={`text-xl font-black mb-2 tracking-tight uppercase ${selected === idx ? 'text-white' : 'text-gray-500'}`}>
                                    {feature.title}
                                </h3>
                                <p className={`text-sm font-light leading-relaxed ${selected === idx ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {feature.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-8 h-[550px] border border-white/10 bg-[#050505] relative overflow-hidden group/viewport">
                        <div className="absolute inset-0 tech-bg opacity-[0.05] pointer-events-none"></div>
                        <div className="absolute top-0 left-0 p-3 border-b border-r border-white/10 bg-[#080808] z-20">
                            <span className="text-[9px] font-mono text-gray-500 uppercase font-black tracking-widest">Viewport_Telemetry // Active</span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selected}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full p-8 flex items-center justify-center"
                            >
                                <div className="w-full max-w-2xl aspect-video border border-white/10 bg-[#0C0C0C] shadow-2xl relative">
                                    <div className="absolute inset-0 flex flex-col">
                                        <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-[#111]">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-polygon-purple/40"></div>
                                                <div className="w-2 h-2 rounded-full bg-white/10"></div>
                                            </div>
                                            <div className="text-[10px] font-mono text-gray-500 font-bold tracking-widest uppercase">
                                                {FEATURES[selected].title}
                                            </div>
                                        </div>
                                        <div className="flex-1 relative">
                                            {FEATURES[selected].mock}
                                        </div>
                                        <div className="h-14 border-t border-white/10 flex divide-x divide-white/5">
                                            {FEATURES[selected].stats.map((stat, i) => (
                                                <div key={i} className="flex-1 flex flex-col justify-center px-6 bg-[#080808]">
                                                    <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">{stat.label}</span>
                                                    <span className="text-base text-white font-mono font-bold tracking-tighter">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
