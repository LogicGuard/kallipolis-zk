
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberpunkLogo from './CyberpunkLogo';
import Button from '../common/Button';
import { 
    ChevronDownIcon, AuditorIcon, FirewallIcon, 
    WalletIcon, MenuIcon, XIcon, ActivityIcon, 
    GlobeIcon, ShieldCheckIcon, ZapIcon, StarIcon
} from '../Icons';
import { useNavigation } from '../../context/NavigationContext';

interface LandingNavbarProps {
    onOpenAuth: (mode: 'login' | 'signup') => void;
    onOpenContact: () => void;
}

const PLATFORM_MODULES = [
    { 
        title: 'Algorithmic Auditor', 
        desc: 'Formal verification & static analysis kernel.', 
        icon: AuditorIcon, 
        id: 'security-audits', 
        secondary: 'smart-contract-auditor',
        tag: 'V3_CORE'
    },
    { 
        title: 'Transaction Firewall', 
        desc: 'Real-time pre-execution shielding protocol.', 
        icon: FirewallIcon, 
        id: 'real-time-security', 
        secondary: 'smart-contract-firewall',
        tag: 'HOT_FIX'
    },
    { 
        title: 'Identity Recon', 
        desc: 'Deep wallet forensics and behavior mapping.', 
        icon: WalletIcon, 
        id: 'asset-intelligence', 
        secondary: 'wallet-report',
        tag: 'ALPHA'
    },
    { 
        title: 'AggLayer Monitor', 
        desc: 'Global signal tracking across Polygon chains.', 
        icon: ActivityIcon, 
        id: 'real-time-security', 
        secondary: 'on-chain-monitor',
        tag: 'LIVE'
    },
];

const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenAuth, onOpenContact }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { navigateTo } = useNavigation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleModuleClick = (id: string, secondary?: string) => {
        navigateTo(id, secondary);
        setIsMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav 
            className={`fixed top-0 w-full z-[1000] transition-all duration-700 ${
                scrolled 
                    ? 'bg-[#020202]/90 backdrop-blur-2xl border-b border-white/10 h-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,1)]' 
                    : 'bg-transparent h-24'
            }`}
        >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full flex justify-between items-center">
                
                {/* 1. BRANDING & CORE LINKS */}
                <div className="flex items-center gap-12">
                    <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer">
                        <CyberpunkLogo className={`${scrolled ? 'scale-75' : 'scale-90'} transition-transform duration-500 origin-left`} />
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-8">
                        {/* Mega Menu Trigger */}
                        <div 
                            className="relative h-full flex items-center"
                            onMouseEnter={() => setIsMegaMenuOpen(true)}
                            onMouseLeave={() => setIsMegaMenuOpen(false)}
                        >
                            <button className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase cursor-pointer group py-4">
                                <span className="relative">
                                    Platform
                                    <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-polygon-purple transition-all group-hover:w-full"></div>
                                </span>
                                <ChevronDownIcon className={`w-3 h-3 transition-transform duration-500 ${isMegaMenuOpen ? 'rotate-180 text-polygon-purple' : 'text-gray-600'}`} />
                            </button>

                            <AnimatePresence>
                                {isMegaMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                        className="absolute top-[80%] left-[-20px] w-[640px] bg-[#0A0A0A] shadow-[0_30px_100px_rgba(0,0,0,1)] border border-white/10 rounded-sm overflow-hidden"
                                    >
                                        <div className="absolute inset-0 tech-bg opacity-[0.05] pointer-events-none"></div>
                                        <div className="grid grid-cols-2 gap-1 p-3 relative z-10">
                                            {PLATFORM_MODULES.map((module, i) => (
                                                <motion.div 
                                                    key={i}
                                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                                    onClick={() => handleModuleClick(module.id, module.secondary)}
                                                    className="group p-5 rounded-sm cursor-pointer transition-all border border-transparent hover:border-white/5"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="p-2 bg-polygon-purple/10 border border-polygon-purple/20 rounded-sm group-hover:bg-polygon-purple group-hover:text-white text-polygon-purple-light transition-all">
                                                            <module.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[8px] font-mono text-gray-600 group-hover:text-polygon-purple-light transition-colors font-black uppercase tracking-widest">{module.tag}</span>
                                                    </div>
                                                    <h4 className="text-[12px] font-bold text-white uppercase tracking-wider mb-1">{module.title}</h4>
                                                    <p className="text-[10px] text-gray-500 font-mono leading-relaxed">{module.desc}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="bg-white/[0.02] p-4 border-t border-white/5 flex justify-between items-center px-8">
                                            <div className="flex items-center gap-6">
                                                <span className="text-[9px] font-mono text-gray-600 uppercase flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                                    Uptime: 99.99%
                                                </span>
                                                <span className="text-[9px] font-mono text-gray-600 uppercase flex items-center gap-2">
                                                    <ZapIcon className="w-3 h-3 text-yellow-500" />
                                                    Latency: 400ms
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleModuleClick('documentation')}
                                                className="text-[9px] font-mono text-polygon-purple-light hover:text-white transition-colors uppercase font-black tracking-widest underline underline-offset-4 decoration-polygon-purple/30"
                                            >
                                                View_Full_Specs
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={() => handleModuleClick('documentation', 'pitch-deck')}
                            className="text-[9px] font-black tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase group relative py-4 flex items-center gap-2"
                        >
                            <StarIcon className="w-3 h-3 text-yellow-500/50 group-hover:text-yellow-500 transition-colors" />
                            Investor_Deck
                            <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-polygon-purple transition-all group-hover:w-full"></div>
                        </button>

                        <button 
                            onClick={() => handleModuleClick('ecosystem-insights', 'node-health')}
                            className="text-[9px] font-black tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase group relative py-4"
                        >
                            Infrastructure
                            <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-polygon-purple transition-all group-hover:w-full"></div>
                        </button>
                        
                        <button 
                            onClick={() => {
                                const section = document.getElementById('pricing');
                                section?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[9px] font-black tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase group relative py-4"
                        >
                            Pricing
                            <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-polygon-purple transition-all group-hover:w-full"></div>
                        </button>
                    </div>
                </div>

                {/* 2. HUD & ACTION BUTTONS */}
                <div className="flex items-center gap-6 xl:gap-8">
                    
                    {/* Live Network Pulse (HUD Element) */}
                    <div className="hidden xl:flex flex-col items-end border-l border-white/10 pl-8 gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-gray-600 font-black uppercase tracking-widest leading-none">POLYGON_PULSE</span>
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-[10px] font-mono text-white/50 leading-none">
                            <span className="text-white">62</span> GWEI
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <button 
                            onClick={() => onOpenAuth('login')}
                            className="text-[9px] font-black tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase px-3"
                        >
                            Log_In
                        </button>
                        <Button 
                            onClick={() => onOpenAuth('signup')}
                            className="!px-6 py-2.5 !bg-white !text-black hover:!bg-polygon-purple hover:!text-white border-none rounded-none transition-all font-black uppercase text-[10px] tracking-[0.1em] group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Launch_Core
                                <ShieldCheckIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                        </Button>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 bg-white/5 border border-white/10 hover:border-polygon-purple transition-all rounded-sm"
                    >
                        <MenuIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2000]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-[85%] max-w-[400px] bg-[#050505] border-l border-white/10 z-[2001] flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#080808]">
                                <CyberpunkLogo className="scale-75" />
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <XIcon className="w-8 h-8" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
                                <div className="space-y-6">
                                    <div className="text-[9px] font-mono text-polygon-purple-light uppercase font-black tracking-[0.3em] mb-4">Core_Systems</div>
                                    <button 
                                        onClick={() => handleModuleClick('documentation', 'pitch-deck')}
                                        className="w-full flex items-center gap-5 p-3.5 bg-yellow-500/5 border border-yellow-500/10 hover:border-yellow-500 transition-all text-left"
                                    >
                                        <StarIcon className="w-5 h-5 text-yellow-500" />
                                        <div>
                                            <div className="text-xs font-black text-white uppercase tracking-wider">Investor Deck</div>
                                            <div className="text-[8px] text-gray-500 font-mono mt-0.5">Presentation // S1</div>
                                        </div>
                                    </button>
                                    {PLATFORM_MODULES.map((module, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleModuleClick(module.id, module.secondary)}
                                            className="w-full flex items-center gap-5 p-3.5 bg-white/[0.02] border border-white/5 hover:border-polygon-purple transition-all text-left group"
                                        >
                                            <module.icon className="w-5 h-5 text-polygon-purple-light group-hover:scale-110 transition-transform" />
                                            <div>
                                                <div className="text-xs font-black text-white uppercase tracking-wider">{module.title}</div>
                                                <div className="text-[8px] text-gray-500 font-mono mt-0.5">{module.tag} // Ready</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-[#080808] border-t border-white/5 space-y-4">
                                <Button 
                                    onClick={() => onOpenAuth('signup')}
                                    className="w-full py-4 !bg-white !text-black uppercase font-black tracking-widest rounded-none border-none"
                                >
                                    INITIALIZE_SESSION
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default LandingNavbar;
