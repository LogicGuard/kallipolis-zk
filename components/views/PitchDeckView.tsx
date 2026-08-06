
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
    ChevronUpIcon, ActivityIcon, ShieldCheckIcon, 
    GlobeIcon, ZapIcon, LayersIcon, CpuIcon, TrendingUpIcon, 
    AuditorIcon, FirewallIcon, WalletIcon, StarIcon, 
    CodeIcon, ClockIcon, SearchIcon, CheckIcon, SparklesIcon
} from '../Icons';
import { useNavigation } from '../../context/NavigationContext';

type LayoutType = 'hero' | 'problem' | 'grid' | 'comparison' | 'roadmap' | 'stats' | 'visualizer';

interface SlideData {
    id: number;
    section: string;
    tag: string;
    title: string;
    subtitle: string;
    content: string;
    icon: React.FC<any>;
    color: string;
    layout: LayoutType;
    features?: { title: string; desc: string; icon?: React.FC<any> }[];
    stats?: { label: string, val: string }[];
    comparison?: { metric: string; kallipolis: string; traditional: string }[];
}

const SLIDES: SlideData[] = [
    {
        id: 1,
        section: "VISION",
        tag: "SYSTEM_GENESIS_2026",
        title: "Sovereign Security for the AggLayer",
        subtitle: "The AI-Native Defense Standard for Polygon",
        content: "Kallipolis ZK is the first autonomous security kernel engineered to protect $150B+ in cross-chain liquidity across the fully decentralized Polygon AggLayer ecosystem.",
        icon: ShieldCheckIcon,
        color: "text-polygon-purple",
        layout: "hero"
    },
    {
        id: 2,
        section: "PROBLEM",
        tag: "THREAT_SURFACE_ANALYSIS",
        title: "The $4.1B Security Latency Gap",
        subtitle: "Manual audits are static; 2026 threats are sub-second.",
        content: "In the modular future, finality times are near-zero. The gap between exploit signature and detection has become the primary vector for institutional losses. Static audits can't keep up with modular execution.",
        icon: ActivityIcon,
        color: "text-red-500",
        layout: "stats",
        stats: [
            { label: "Lost in 2025", val: "$4.1B" },
            { label: "Attack Speed", val: "< 600ms" },
            { label: "Audit Delay", val: "22 Days" }
        ]
    },
    {
        id: 3,
        section: "CORE_TECH",
        tag: "HEURISTIC_KERNEL_S1",
        title: "Gemini-Powered Logic Kernels",
        subtitle: "Deep Opcode Inference & Pattern Recognition",
        content: "Our proprietary kernel performs deep opcode-level inference on every state transition. We identify malicious intent before a transaction ever hits the block using high-fidelity vector mapping.",
        icon: CpuIcon,
        color: "text-blue-400",
        layout: "visualizer"
    },
    {
        id: 4,
        section: "PRODUCT",
        tag: "MODULE_01: AUDIT",
        title: "Algorithmic Auditor v3",
        subtitle: "Automated Formal Verification at Scale",
        content: "The industry-standard for smart contract safety. Capable of scanning 25M+ lines of Solidity code with 96.8% precision in vulnerability detection across ZK-circuits.",
        icon: AuditorIcon,
        color: "text-purple-400",
        layout: "grid",
        features: [
            { title: "Logic CFG", desc: "Mapping control-flow graphs.", icon: CodeIcon },
            { title: "Static Analysis", desc: "Bytecode-level heuristics.", icon: LayersIcon },
            { title: "Gas Forensics", desc: "Bytecode optimization.", icon: ZapIcon }
        ]
    },
    {
        id: 5,
        section: "PRODUCT",
        tag: "MODULE_02: SHIELD",
        title: "Pre-Execution Firewall",
        subtitle: "The Zero-Day Mempool Shield",
        content: "A distributed firewall network for Polygon CDK chains. It simulates and quarantines malicious multicalls in under 350ms, neutralizing reentrancy at the source.",
        icon: FirewallIcon,
        color: "text-red-400",
        layout: "grid",
        features: [
            { title: "Packet Inspection", desc: "Decoding hex data streams.", icon: SearchIcon },
            { title: "Simulation Core", desc: "Shadow state execution.", icon: ActivityIcon },
            { title: "Quarantine", desc: "Autonomous blocking logic.", icon: ShieldCheckIcon }
        ]
    },
    {
        id: 6,
        section: "PRODUCT",
        tag: "MODULE_03: RECON",
        title: "Identity Intelligence",
        subtitle: "Forensic Asset & Behavior Tracking",
        content: "Deep-dive identities and provenance across the AggLayer. We provide institutional-grade dossier reports for every active address and ZK-rollup cluster.",
        icon: WalletIcon,
        color: "text-green-400",
        layout: "grid",
        features: [
            { title: "Behavior Engine", desc: "Predictive user modeling.", icon: TrendingUpIcon },
            { title: "Asset Lineage", desc: "Trace tokens to genesis.", icon: GlobeIcon },
            { title: "Risk Scoring", desc: "Dynamic trust indices.", icon: StarIcon }
        ]
    },
    {
        id: 7,
        section: "INFRA",
        tag: "NETWORK_HEALTH_MATRIX",
        title: "Global Sentinel Network",
        subtitle: "Real-time Infrastructure Telemetry",
        content: "Monitoring 4,096 sentinel nodes globally. We ensure the uptime and integrity of the infrastructure that powers the value layer across all Polygon L2 clusters.",
        icon: GlobeIcon,
        color: "text-cyan-400",
        layout: "visualizer"
    },
    {
        id: 8,
        section: "MARKET",
        tag: "STRATEGIC_MOAT",
        title: "Competitive Superiority",
        subtitle: "Kallipolis ZK vs. Legacy Scanners",
        content: "Speed and depth of analysis are our ultimate moats. We move at the speed of the network, not the speed of the auditor. Built for the modular 2026 future.",
        icon: ZapIcon,
        color: "text-polygon-purple-light",
        layout: "comparison",
        comparison: [
            { metric: "Detection Latency", kallipolis: "350ms (Real-time)", traditional: "14 Days (Manual)" },
            { metric: "Analysis Depth", kallipolis: "Heuristic Opcode", traditional: "Pattern Static" },
            { metric: "AggLayer Support", kallipolis: "Native Cluster", traditional: "None / Bridge-only" },
            { metric: "Response Type", kallipolis: "Autonomous Block", traditional: "Post-Exploit Alert" }
        ]
    },
    {
        id: 9,
        section: "ROADMAP",
        tag: "GO_TO_MARKET_STRATEGY",
        title: "2026 Execution Map",
        subtitle: "Scaling Defense Globally",
        content: "From alpha ingestion to full sovereign OS decentralization. We are building the permanent security layer of Web3.",
        icon: ClockIcon,
        color: "text-blue-500",
        layout: "roadmap"
    },
    {
        id: 10,
        section: "THE_ASK",
        tag: "SERIES_A_INVESTMENT",
        title: "Funding the Revolution",
        subtitle: "$15M Target: Scaling the Kernel",
        content: "Seeking strategic partners to scale our heuristic node network and establish Kallipolis ZK as the default security module for institutional chains.",
        icon: StarIcon,
        color: "text-white",
        layout: "hero"
    }
];

const SECTIONS = ["VISION", "PROBLEM", "TECH", "PRODUCT", "INFRA", "STRATEGY", "ROADMAP", "ASK"];

const PitchDeckView: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [investmentAmount, setInvestmentAmount] = useState(500000); // Default $500,000
    const { navigateTo } = useNavigation();

    const nextSlide = useCallback(() => {
        if (currentSlide < SLIDES.length - 1) {
            setDirection(1);
            setCurrentSlide(prev => prev + 1);
        }
    }, [currentSlide]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    const slide = SLIDES[currentSlide];

    const renderLayout = (slide: SlideData) => {
        switch (slide.layout) {
            case 'hero':
                return (
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 h-full overflow-hidden">
                        <div className="w-full lg:w-3/5 space-y-6">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-sm mb-4">
                                    <div className={`w-1 h-3 ${slide.color.replace('text', 'bg')}`}></div>
                                    <span className={`text-[8px] font-mono ${slide.color} font-black uppercase tracking-[0.3em]`}>// {slide.tag}</span>
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-6">
                                    {slide.title.split(' ').map((word, i) => (
                                        <span key={i} className={i === slide.title.split(' ').length - 1 ? slide.color : ''}>{word} </span>
                                    ))}
                                </h1>
                                <p className="text-base text-gray-400 font-light leading-relaxed max-w-xl border-l border-white/10 pl-6 italic">
                                    {slide.content}
                                </p>
                            </motion.div>
                            <div className="flex flex-wrap gap-3">
                                <Button 
                                    onClick={() => navigateTo('dashboard')}
                                    className="!px-8 py-3.5 bg-white text-black font-black uppercase text-[10px] tracking-[0.15em] hover:!bg-polygon-purple hover:!text-white transition-all shadow-lg border-none"
                                >
                                    LAUNCH_CORE_INTERFACE
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="!px-6 py-3.5 border-white/10 text-[9px] uppercase font-bold tracking-widest hover:bg-white/5"
                                >
                                    Download_Strategy_Deck
                                </Button>
                            </div>
                        </div>
                        <div className="w-full lg:w-2/5 flex justify-center relative">
                            {slide.section === 'THE_ASK' ? (
                                <div className="w-full bg-[#050505] border border-white/5 p-6 rounded-none relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute inset-0 tech-bg opacity-[0.03]"></div>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <span className="text-[8px] font-mono text-gray-500 uppercase font-black">Investment_Modeler</span>
                                            <span className="text-[7px] font-mono text-polygon-purple-light uppercase font-black tracking-widest">Confidential // Series_A</span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-mono font-bold text-gray-400">
                                                <span>ALLOCATION</span>
                                                <span className="text-white">${(investmentAmount / 1000).toLocaleString()}K</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min={100000} 
                                                max={5000000} 
                                                step={50000}
                                                value={investmentAmount} 
                                                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                                                className="w-full accent-polygon-purple bg-white/10 h-1 rounded-none outline-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[7px] font-mono text-gray-600">
                                                <span>MIN: $100K</span>
                                                <span>MAX: $5.0M</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 bg-[#080808] border border-white/5">
                                                <span className="text-[7px] font-mono text-gray-500 uppercase block mb-1">Ownership %</span>
                                                <span className="text-base font-mono font-black text-white">{((investmentAmount / 150000000) * 100).toFixed(3)}%</span>
                                            </div>
                                            <div className="p-3 bg-[#080808] border border-white/5">
                                                <span className="text-[7px] font-mono text-gray-500 uppercase block mb-1">Nodes Funded</span>
                                                <span className="text-base font-mono font-black text-polygon-purple-light">{(investmentAmount / 50000).toFixed(0)}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-polygon-purple/5 border border-polygon-purple/20">
                                            <span className="text-[7px] font-mono text-gray-500 uppercase block mb-1">Theoretical Protected TVL Cap</span>
                                            <span className="text-sm font-mono font-black text-white">${((investmentAmount * 420) / 1000000).toFixed(1)}M</span>
                                            <span className="text-[6.5px] font-mono text-gray-500 uppercase block mt-1">Calculated under 420x security leverage ratio</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
                                        <span className="text-[7px] font-mono text-gray-600 uppercase">Valuation: $150M Post</span>
                                        <span className="text-[7px] font-mono text-green-500 uppercase">LOCK_ALLOCATION_SECURE // S1_A</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`absolute inset-0 ${slide.color.replace('text', 'bg')}/10 blur-[120px] rounded-full animate-pulse`}></div>
                                    <motion.div 
                                        animate={{ y: [0, -10, 0], rotateZ: [0, 2, 0] }} 
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative z-10"
                                    >
                                        <slide.icon className={`w-48 h-48 lg:w-60 lg:h-60 ${slide.color} opacity-30 blur-2xl absolute inset-0 scale-125`} />
                                        <slide.icon className={`w-48 h-48 lg:w-60 lg:h-60 ${slide.color} relative z-10 drop-shadow-[0_0_30px_rgba(123,63,228,0.4)]`} />
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'stats':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center h-full overflow-hidden">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-3">
                                <h2 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                                    {slide.title}
                                </h2>
                                <p className="text-gray-400 text-lg font-light">{slide.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {slide.stats?.map((s, i) => (
                                    <div key={i} className="p-6 bg-[#0C0C0C] border border-white/5 group hover:border-red-500/20 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/5 group-hover:bg-red-500/20 transition-all"></div>
                                        <div className="text-[8px] font-mono text-gray-600 uppercase mb-3 font-black tracking-widest">{s.label}</div>
                                        <div className={`text-2xl font-black font-mono text-white tracking-tighter`}>{s.val}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 font-light max-w-2xl">{slide.content}</p>
                        </div>
                        <div className="lg:col-span-5 h-[350px] relative bg-black border border-white/5 rounded-none overflow-hidden flex items-center justify-center p-8">
                             <div className="absolute inset-0 tech-bg opacity-[0.05]"></div>
                             <div className="text-center relative z-10 space-y-4">
                                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }}>
                                    <ActivityIcon className="w-32 h-32 text-red-500/20 mx-auto" />
                                </motion.div>
                                <div className="space-y-1">
                                    <div className="text-[9px] font-mono text-red-500 font-black uppercase tracking-[0.3em] animate-pulse">Critical_Exploit_Vector</div>
                                    <div className="text-[7px] font-mono text-gray-700 uppercase tracking-widest font-black">Mempool_Calibration_Buffer_Overrun</div>
                                </div>
                             </div>
                        </div>
                    </div>
                );
            case 'grid':
                return (
                    <div className="space-y-10 h-full flex flex-col justify-center overflow-hidden">
                        <div className="max-w-4xl space-y-2">
                            <span className={`text-[8px] font-mono ${slide.color} font-black uppercase tracking-[0.4em] border-b border-white/10 pb-1`}>PROTOCOL_ARCHITECTURE</span>
                            <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">{slide.title}</h2>
                            <p className="text-gray-400 text-base font-light">{slide.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {slide.features?.map((f, i) => (
                                <Card key={i} className="p-6 bg-white/[0.01] border-white/5 hover:border-white/20 transition-all group relative overflow-hidden flex flex-col justify-between h-[210px]">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                        {f.icon ? <f.icon className="w-24 h-24" /> : <ShieldCheckIcon className="w-24 h-24" />}
                                    </div>
                                    <div className={`p-2.5 bg-white/5 border border-white/10 rounded-sm w-fit group-hover:${slide.color.replace('text', 'bg')} group-hover:text-black transition-all duration-300`}>
                                        {f.icon ? <f.icon className="w-5 h-5" /> : <ShieldCheckIcon className="w-5 h-5" />}
                                    </div>
                                    <div className="space-y-1 relative z-10">
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{f.title}</h4>
                                        <p className="text-[9px] text-gray-500 font-mono leading-relaxed uppercase tracking-wider">{f.desc}</p>
                                    </div>
                                    <div className="w-full h-0.5 bg-white/5 mt-4 overflow-hidden">
                                        <motion.div className={`h-full ${slide.color.replace('text', 'bg')}`} initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 1, delay: i * 0.1 }} />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 'comparison':
                return (
                    <div className="space-y-10 h-full flex flex-col justify-center max-w-5xl mx-auto overflow-hidden">
                         <div className="text-center space-y-3">
                            <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter">{slide.title}</h2>
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <p className="text-gray-500 text-[8px] uppercase tracking-[0.4em] font-mono whitespace-nowrap">Industry_Benchmarks_2026</p>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>
                        </div>
                        <div className="border border-white/10 bg-[#080808] overflow-hidden shadow-2xl rounded-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/[0.03]">
                                            <th className="p-5 text-[9px] text-gray-500 uppercase tracking-widest font-black">Strategic_Metric</th>
                                            <th className="p-5 text-[9px] text-gray-500 uppercase tracking-widest text-center font-black">Legacy Auditor</th>
                                            <th className="p-5 text-[9px] text-polygon-purple-light uppercase tracking-widest text-center bg-polygon-purple/5 font-black border-l border-white/10">Kallipolis ZK_v4</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {slide.comparison?.map((row, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-5 text-gray-400 font-bold uppercase text-[10px]">{row.metric}</td>
                                                <td className="p-5 text-gray-600 text-center text-[10px] opacity-70">{row.traditional}</td>
                                                <td className="p-5 text-white font-black text-center bg-polygon-purple/[0.02] text-[10px] border-l border-white/10 group-hover:text-polygon-purple-light transition-colors">
                                                    {row.kallipolis}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'roadmap':
                return (
                    <div className="h-full flex flex-col justify-center overflow-hidden">
                        <h2 className="text-5xl lg:text-7xl font-black text-white uppercase mb-16 tracking-tighter text-center">Execution <span className="text-blue-500">2026</span></h2>
                        <div className="relative px-8 max-w-5xl mx-auto w-full">
                            <div className="absolute top-10 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                    { q: "Q1_2026", label: "Alpha Cluster", desc: "Heuristic kernel ingestion.", status: 'done' },
                                    { q: "Q2_2026", label: "Sentry Nodes", desc: "4,096 verification nodes.", status: 'active' },
                                    { q: "Q3_2026", label: "Shield Protocol", desc: "Unified AggLayer firewall.", status: 'pending' },
                                    { q: "Q4_2026", label: "Sovereign OS", desc: "Full decentralization.", status: 'pending' }
                                ].map((item, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="relative z-10 text-center group">
                                        <div className={`w-8 h-8 rounded-none rotate-45 mx-auto mb-6 border transition-all duration-500 ${
                                            item.status === 'done' ? 'bg-blue-500 border-blue-400' : 
                                            item.status === 'active' ? 'bg-black border-blue-500 animate-pulse' : 
                                            'bg-black border-white/10'
                                        } flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]`}>
                                            {item.status === 'done' && <CheckIcon className="w-4 h-4 text-white -rotate-45" />}
                                        </div>
                                        <h4 className="text-blue-500 font-black font-mono text-[10px] mb-2">{item.q}</h4>
                                        <div className="text-white font-bold uppercase text-[11px] mb-2 tracking-tighter">{item.label}</div>
                                        <p className="text-[9px] text-gray-600 font-mono leading-tight uppercase opacity-60 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'visualizer':
                return (
                    <div className="flex flex-col justify-center h-full space-y-12 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className={`text-[9px] font-mono ${slide.color} font-black uppercase tracking-[0.4em] animate-pulse`}>// Telemetry_Link_Active</span>
                                <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">{slide.title}</h2>
                                <p className="text-base text-gray-400 font-light leading-relaxed border-l border-white/10 pl-6 italic">{slide.content}</p>
                                <Button 
                                    onClick={() => navigateTo('ecosystem-insights', 'security-analytics')}
                                    variant="secondary" 
                                    className="!px-6 py-3 border-white/10 uppercase font-black text-[9px] tracking-[0.15em] hover:!border-blue-500/40"
                                >
                                    OPEN_LIVE_MAP
                                </Button>
                            </div>
                            <div className="bg-[#050505] border border-white/10 p-8 h-[280px] lg:h-[320px] relative group overflow-hidden shadow-inner">
                                <div className="absolute inset-0 tech-bg opacity-[0.05]"></div>
                                <div className="h-full flex items-end gap-1 px-2 relative z-10">
                                    {Array.from({length: 40}).map((_, i) => (
                                        <motion.div 
                                            key={i} 
                                            className={`flex-1 ${slide.color.replace('text', 'bg')} bg-opacity-20 border-t border-white/10`}
                                            animate={{ height: `${15 + Math.random() * 80}%` }}
                                            transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.03 }}
                                        />
                                    ))}
                                </div>
                                <div className="absolute top-4 left-8 text-[7px] font-mono text-gray-700 uppercase font-black tracking-[0.4em]">Inference_Load // S1_Kernel</div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col max-w-[1500px] mx-auto relative select-none overflow-hidden">
            
            {/* Executive Deck HUD */}
            <div className="flex justify-between items-center mb-6 px-6 flex-shrink-0">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-polygon-purple/10 border border-polygon-purple/20 rounded-sm shadow-[0_0_10px_rgba(123,63,228,0.15)]">
                            <StarIcon className="w-5 h-5 text-polygon-purple-light" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] leading-none">Series_A_Investment</h2>
                            <span className="text-[8px] font-mono text-gray-700 uppercase mt-1.5 block tracking-widest font-black">Kallipolis ZK // Confidential // v4.2</span>
                        </div>
                    </div>

                    {/* Progress HUD Dots */}
                    <div className="hidden xl:flex items-center gap-6 border-l border-white/5 pl-10">
                        {SECTIONS.map((sec, i) => {
                            const isCurrent = slide.section.includes(sec);
                            const isPast = SLIDES.findIndex(s => s.section.includes(sec)) < currentSlide;
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-none rotate-45 transition-all duration-500 ${isCurrent ? 'bg-polygon-purple scale-125 shadow-[0_0_8px_#7b3fe4]' : isPast ? 'bg-gray-700' : 'bg-gray-900'}`}></div>
                                    <span className={`text-[8px] font-mono font-black uppercase tracking-widest transition-colors duration-500 ${isCurrent ? 'text-white' : 'text-gray-800'}`}>{sec}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-mono text-gray-700 uppercase font-black tracking-widest">Sequence_Step</span>
                        <span className="text-base font-mono text-white font-black">{currentSlide + 1} <span className="text-gray-800">/ {SLIDES.length}</span></span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={prevSlide} 
                            disabled={currentSlide === 0} 
                            className="p-3 hover:bg-white/5 border border-white/10 disabled:opacity-10 transition-all rounded-sm group active:scale-95"
                        >
                            <ChevronUpIcon className="-rotate-90 w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={nextSlide} 
                            disabled={currentSlide === SLIDES.length - 1} 
                            className="p-3 hover:bg-white/5 border border-white/10 disabled:opacity-10 transition-all rounded-sm group active:scale-95"
                        >
                            <ChevronUpIcon className="rotate-90 w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cinematic Slide Stage */}
            <div className="flex-1 relative overflow-hidden bg-[#010101] border border-white/5 rounded-none shadow-[0_30px_100px_rgba(0,0,0,1)]">
                <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-polygon-purple/40 to-transparent opacity-40"></div>
                
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: direction * -50, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute inset-0 p-10 lg:p-16 flex flex-col"
                    >
                        {renderLayout(slide)}
                    </motion.div>
                </AnimatePresence>

                {/* Tactical HUD Footer inside the stage */}
                <div className="absolute bottom-6 left-10 right-10 flex justify-between items-center text-[7px] font-mono text-gray-800 uppercase tracking-[0.5em] pointer-events-none font-black">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><div className="w-1 h-1 bg-polygon-purple animate-pulse shadow-[0_0_5px_#7b3fe4]"></div> UPLINK_SECURE</span>
                        <span className="opacity-30">HEX_SIG: {Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
                    </div>
                    <span className="text-polygon-purple/10">© KALLIPOLIS_ZK_SYSTEMS_2026</span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                    <motion.div 
                        className="h-full bg-polygon-purple shadow-[0_0_15px_#7b3fe4]"
                        animate={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="mt-8 flex justify-center gap-2 overflow-x-auto no-scrollbar pb-6 px-4">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => {
                            setDirection(i > currentSlide ? 1 : -1);
                            setCurrentSlide(i);
                        }}
                        className={`group relative flex-shrink-0 w-12 lg:w-14 h-1 transition-all duration-500 ${
                            i === currentSlide ? 'bg-polygon-purple lg:w-20 shadow-[0_0_10px_#7b3fe4]' : i < currentSlide ? 'bg-gray-700' : 'bg-gray-900 hover:bg-gray-700'
                        }`}
                    >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[7px] font-mono text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black whitespace-nowrap tracking-widest">
                            NODE_0{i+1}
                        </span>
                    </button>
                ))}
            </div>

            {/* Subtle Outer Accents */}
            <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b border-l border-white/5 pointer-events-none"></div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b border-r border-white/5 pointer-events-none"></div>
        </div>
    );
};

export default PitchDeckView;
