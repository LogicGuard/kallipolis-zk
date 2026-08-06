
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { CpuIcon, ShieldCheckIcon, ActivityIcon } from '../Icons';

interface AuditThread {
    id: string;
    protocol: string;
    vector: 'REENTRANCY' | 'LOGIC' | 'OVERFLOW' | 'ACCESS';
    score: number;
    status: 'SCANNING' | 'VERIFIED' | 'FLAGGED';
}

const HeuristicMatrix: React.FC = () => {
    const [threads, setThreads] = useState<AuditThread[]>([]);

    useEffect(() => {
        const protocols = ['AAVE_V3', 'UNISWAP_V4', 'POL_BRIDGE', 'QUICKSWAP', 'ZK_PROVER', 'STAKE_HUB'];
        const vectors: AuditThread['vector'][] = ['REENTRANCY', 'LOGIC', 'OVERFLOW', 'ACCESS'];
        
        const generateThread = (): AuditThread => ({
            id: Math.random().toString(36).substr(2, 4).toUpperCase(),
            protocol: protocols[Math.floor(Math.random() * protocols.length)],
            vector: vectors[Math.floor(Math.random() * vectors.length)],
            score: 70 + Math.random() * 30,
            status: Math.random() > 0.8 ? 'FLAGGED' : 'SCANNING'
        });

        // Initialize
        setThreads(Array.from({ length: 6 }, generateThread));

        const interval = setInterval(() => {
            setThreads(prev => {
                const newThreads = [...prev];
                newThreads.shift();
                newThreads.push(generateThread());
                return newThreads;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        // FIX: Removed unsupported 'title' prop from Card component.
        <Card className="h-full bg-[#030303] border-white/5 p-0 flex flex-col shadow-2xl relative overflow-hidden rounded-none">
            <div className="absolute inset-0 tech-bg opacity-[0.02] pointer-events-none"></div>
            
            <div className="bg-[#0A0A0A] p-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                    <span className="text-[7px] font-mono text-gray-500 uppercase font-black">Thread_ID</span>
                    <span className="text-[7px] font-mono text-gray-500 uppercase font-black">Protocol_Target</span>
                    <span className="text-[7px] font-mono text-gray-500 uppercase font-black">Vector_Signature</span>
                </div>
                <span className="text-[7px] font-mono text-blue-500 uppercase font-black">Status_Pulse</span>
            </div>

            <div className="flex-1 overflow-hidden p-2 space-y-1 bg-black/40">
                <AnimatePresence initial={false} mode="popLayout">
                    {threads.map((thread) => (
                        <motion.div
                            key={thread.id}
                            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                            transition={{ duration: 0.4 }}
                            className={`flex items-center justify-between p-3 border ${
                                thread.status === 'FLAGGED' ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/[0.01]'
                            } hover:bg-white/[0.04] transition-colors relative group`}
                        >
                            <div className="flex items-center gap-6">
                                <span className="text-[9px] font-mono text-gray-500 w-10">#{thread.id}</span>
                                <span className="text-[10px] font-mono text-white font-black w-24 truncate">{thread.protocol}</span>
                                <div className="flex items-center gap-2 w-24">
                                    <div className={`w-1 h-1 rounded-full ${thread.status === 'FLAGGED' ? 'bg-red-500' : 'bg-blue-400'}`} />
                                    <span className={`text-[8px] font-mono ${thread.status === 'FLAGGED' ? 'text-red-400' : 'text-gray-400'} uppercase font-bold tracking-tighter`}>{thread.vector}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`w-0.5 h-2 rounded-full ${i < (thread.score - 70) / 6 ? 'bg-blue-400' : 'bg-white/5'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[7px] font-mono text-gray-600 mt-0.5">{thread.score.toFixed(1)}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded-none text-[7px] font-black font-mono border ${
                                    thread.status === 'FLAGGED' ? 'bg-red-500/20 text-red-500 border-red-500/20 animate-pulse' : 'bg-blue-500/10 text-blue-400 border-blue-500/10'
                                }`}>
                                    {thread.status}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="p-2 border-t border-white/5 bg-[#050505] flex justify-between items-center text-[7px] font-mono text-gray-700 uppercase tracking-widest">
                <span>Kernel_Throughput: 1.4M pps</span>
                <span className="text-blue-500/40">G_MOD: GEN_3_PRO_KERNEL</span>
            </div>
        </Card>
    );
};

export default HeuristicMatrix;