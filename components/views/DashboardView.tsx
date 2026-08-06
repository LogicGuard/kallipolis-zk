
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import { useNavigation } from '../../context/NavigationContext';
import { systemStatusEvents, getSystemStatus } from '../../services/geminiService';
import IntelligenceBriefing from './IntelligenceBriefing';
import RealTimeMonitor from './RealTimeMonitor';
import NetworkMatrix from './NetworkMatrix';
import ToolsQuickAccess from './ToolsQuickAccess';
import HeuristicMatrix from './HeuristicMatrix';
import ActivityHeatmap from './ActivityHeatmap';
import { DashboardMetricCard, SystemVitalsStrip } from './DashboardWidgets';
import { GlobeIcon, ShieldCheckIcon, ActivityIcon, ZapIcon, ThreatIcon, CpuIcon } from '../Icons';

const DashboardView: React.FC = () => {
    const { account } = useWallet();
    const { navigateTo } = useNavigation();
    const [isCongested, setIsCongested] = useState(getSystemStatus().isCoolingDown);
    const [timeString, setTimeString] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setTimeString(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleStatusChange = (e: any) => setIsCongested(e.detail.isCoolingDown);
        systemStatusEvents.addEventListener('statusChange', handleStatusChange);
        return () => systemStatusEvents.removeEventListener('statusChange', handleStatusChange);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } }
    };

    return (
        <div className="relative h-full w-full bg-[#020202] overflow-y-auto lg:overflow-hidden flex flex-col p-3 md:p-4 gap-3 md:gap-4 select-none custom-scrollbar">
            {/* Minimal Background Elements */}
            <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent pointer-events-none"></div>
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col gap-3 md:gap-4 relative z-10 min-h-0"
            >
                {/* 0. HUD TELEMETRY HEADER BAR */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#080808] border border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-mono font-black text-white uppercase tracking-widest">SYSTEM_LIVE</span>
                        </div>
                        <span className="text-white/10">|</span>
                        <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-widest">
                            NETWORK: <span className="text-blue-400 font-bold">POLYGON AGGLAYER</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-[8.5px] font-mono">
                        <span className="text-gray-500 hidden sm:inline">SWARM_AGENTS: <span className="text-emerald-400 font-bold">8/8 ONLINE</span></span>
                        <span className="text-gray-500 hidden md:inline">ACCOUNT: <span className="text-white font-bold">{account ? `${account.substring(0,6)}...${account.substring(38)}` : '0x71C...49A2'}</span></span>
                        <span className="text-blue-400 font-bold tracking-wider">{timeString}</span>
                    </div>
                </motion.div>

                {/* 1. TOP OPERATIONS RIBBON (QUICK START) */}
                <motion.div variants={itemVariants} className="flex-shrink-0">
                    <ToolsQuickAccess />
                </motion.div>

                {/* 2. TELEMETRY STRIP WITH INTERACTIVE NAVIGATION */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
                    <motion.div variants={itemVariants}>
                        <DashboardMetricCard 
                            label="Global_Nodes" 
                            value="1,024" 
                            sub="99.9% UPTIME" 
                            icon={GlobeIcon} 
                            color="text-blue-400" 
                            trend="+12 Nodes"
                            sparklineData={[920, 940, 980, 1000, 1010, 1024]}
                            onClick={() => navigateTo('network-map', 'consensus-matrix')}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <DashboardMetricCard 
                            label="Security_Index" 
                            value="98.2" 
                            sub="NOMINAL_STATE" 
                            icon={ShieldCheckIcon} 
                            color="text-emerald-400"
                            trend="SECURE"
                            sparklineData={[94, 95, 96, 97, 98, 98.2]}
                            onClick={() => navigateTo('security-audits', 'smart-contract-auditor')}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <DashboardMetricCard 
                            label="Assets_Secured" 
                            value="$1.42B" 
                            sub="VERIFIED_DATA" 
                            icon={ActivityIcon} 
                            color="text-purple-400"
                            trend="+$85M"
                            sparklineData={[1.1, 1.2, 1.25, 1.35, 1.4, 1.42]}
                            onClick={() => navigateTo('asset-intelligence', 'wallet-report')}
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <DashboardMetricCard 
                            label="Active_Shields" 
                            value="42,091" 
                            sub="KERNEL_ONLINE" 
                            icon={ZapIcon} 
                            color="text-blue-500" 
                            trend="+410 rules"
                            sparklineData={[38000, 39500, 40200, 41500, 42091]}
                            onClick={() => navigateTo('real-time-security', 'smart-contract-firewall')}
                        />
                    </motion.div>
                </div>

                {/* 3. MAIN OPERATIONAL HUD - RESTRUCTURED GRID */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 min-h-0 overflow-hidden">
                    
                    {/* LEFT AREA: TOPOLOGY & HEURISTICS */}
                    <div className="lg:col-span-8 flex flex-col gap-3 md:gap-4 min-h-0 overflow-hidden">
                        <div className="flex-[3] grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 min-h-0">
                             <motion.div variants={itemVariants} className="md:col-span-8 min-h-[260px] md:min-h-0 h-full">
                                <NetworkMatrix />
                             </motion.div>
                             <motion.div variants={itemVariants} className="md:col-span-4 min-h-[220px] md:min-h-0 h-full">
                                <ActivityHeatmap />
                             </motion.div>
                        </div>
                        
                        <div className="flex-[2] grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 min-h-0">
                            <motion.div variants={itemVariants} className="md:col-span-7 min-h-[200px] md:min-h-0 h-full">
                                <HeuristicMatrix />
                            </motion.div>
                            <motion.div variants={itemVariants} className="md:col-span-5 min-h-[220px] md:min-h-0 h-full">
                                <IntelligenceBriefing />
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT AREA: LIVE FEED & VITALS */}
                    <div className="lg:col-span-4 flex flex-col gap-3 md:gap-4 min-h-0 overflow-hidden">
                        <motion.div variants={itemVariants} className="flex-[3] min-h-[320px] lg:min-h-0 h-full">
                            <RealTimeMonitor />
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex-[1] min-h-[160px] lg:min-h-0 h-full">
                            <SystemVitalsStrip />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* ALERT SYSTEM */}
            <AnimatePresence>
                {isCongested && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                        className="fixed bottom-6 right-6 z-[200] w-80 bg-[#0A0A0A] border border-blue-900/30 shadow-2xl p-4 tactical-border"
                    >
                        <div className="flex items-center gap-3 text-blue-500 mb-2">
                            <ThreatIcon className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-black font-mono uppercase tracking-widest">Buffer_Threshold</span>
                        </div>
                        <p className="text-[9px] font-mono text-gray-500 uppercase leading-relaxed">
                            System throughput calibrated for high-density signals.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardView;

