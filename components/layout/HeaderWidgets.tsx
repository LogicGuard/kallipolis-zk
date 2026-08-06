
import React, { useState, useEffect, useRef } from 'react';
import { GasIcon, TrendingUpIcon, ActivityIcon, SearchIcon, BellIcon, HelpCircleIcon, ThreatIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter, { Notification } from './NotificationCenter';
import { useNavigation } from '../../context/NavigationContext';

export const SystemStatus: React.FC = () => {
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border-r border-white/10">
      <div className="flex flex-col items-end leading-none">
        <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">System</span>
        <span className="text-[9px] font-mono text-green-500 font-bold uppercase">Nominal</span>
      </div>
      <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
    </div>
  );
};

export const NetworkStats: React.FC = () => {
  const [stats, setStats] = useState({
    gas: 35,
    maticPrice: 0.72,
    priceChange: 2.4,
    tps: 28.5
  });

  const [gasThreshold, setGasThreshold] = useState<string>('');
  const [isGasAlertActive, setIsGasAlertActive] = useState(false);
  const [showGasConfig, setShowGasConfig] = useState(false);
  const gasConfigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        gas: Math.max(20, prev.gas + (Math.random() - 0.5) * 5),
        maticPrice: Math.max(0.5, prev.maticPrice + (Math.random() - 0.5) * 0.01),
        priceChange: prev.priceChange + (Math.random() - 0.5) * 0.1,
        tps: Math.max(10, prev.tps + (Math.random() - 0.5) * 2)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (gasThreshold && stats.gas > parseFloat(gasThreshold)) {
          setIsGasAlertActive(true);
      } else {
          setIsGasAlertActive(false);
      }
  }, [stats.gas, gasThreshold]);

  return (
    <div className="flex items-center gap-0 lg:gap-2 max-w-[200px] lg:max-w-none overflow-hidden relative">
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#030303] to-transparent z-10 lg:hidden"></div>
      
      {/* MATIC Price HUD */}
      <motion.div 
        className="bg-[#0A0A0A] px-2 lg:px-3 py-1.5 flex items-center border-r border-white/10 flex-shrink-0"
      >
        <div className="flex flex-col items-end leading-none">
            <span className="text-[8px] font-mono text-gray-500 uppercase">POL/USD</span>
            <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white font-mono">${stats.maticPrice.toFixed(2)}</span>
            </div>
        </div>
      </motion.div>

      {/* Gas Price HUD */}
      <div className="relative flex-shrink-0" ref={gasConfigRef}>
          <motion.div 
            onClick={() => setShowGasConfig(!showGasConfig)}
            className={`bg-[#0A0A0A] px-2 lg:px-3 py-1.5 flex items-center border-r border-white/10 cursor-pointer ${isGasAlertActive ? 'bg-red-500/10' : ''}`}
          >
            <div className="flex flex-col items-end leading-none">
                 <span className="text-[8px] font-mono text-gray-500 uppercase">GAS</span>
                 <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold font-mono ${isGasAlertActive ? 'text-red-400' : 'text-white'}`}>{Math.round(stats.gas)}</span>
                 </div>
            </div>
          </motion.div>
      </div>

      {/* TPS HUD - Large Screens Only */}
      <motion.div 
        className="hidden lg:flex bg-[#0A0A0A] px-3 py-1.5 items-center flex-shrink-0"
      >
        <div className="flex flex-col items-end leading-none">
             <span className="text-[8px] font-mono text-gray-600 uppercase">TPS</span>
             <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white font-mono">{stats.tps.toFixed(1)}</span>
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
             </div>
        </div>
      </motion.div>
    </div>
  );
};

export const GlobalSearch: React.FC = () => {
    const { navigateTo } = useNavigation();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const searchTargets = [
        { name: 'Smart Contract Auditor', targetPrimary: 'security-audits', targetSecondary: 'smart-contract-auditor', category: 'Audit' },
        { name: 'Contract Scanner', targetPrimary: 'security-audits', targetSecondary: 'smart-contract-scanner', category: 'Audit' },
        { name: 'Transaction Analysis', targetPrimary: 'real-time-security', targetSecondary: 'transaction-analysis', category: 'Security' },
        { name: 'Smart Contract Firewall', targetPrimary: 'real-time-security', targetSecondary: 'smart-contract-firewall', category: 'Security' },
        { name: 'On-Chain Monitor', targetPrimary: 'real-time-security', targetSecondary: 'on-chain-monitor', category: 'Monitor' },
        { name: 'Threat Intelligence', targetPrimary: 'real-time-security', targetSecondary: 'threat-intelligence', category: 'Intel' },
        { name: 'Wallet Report', targetPrimary: 'asset-intelligence', targetSecondary: 'wallet-report', category: 'Assets' },
        { name: 'Portfolio Analysis', targetPrimary: 'asset-intelligence', targetSecondary: 'portfolio-analysis', category: 'Assets' },
        { name: 'Gas Optimizer', targetPrimary: 'optimization-strategy', targetSecondary: 'gas-optimizer', category: 'Optimize' },
        { name: 'ZK Compliance', targetPrimary: 'advanced-security', targetSecondary: 'zk-compliance', category: 'Compliance' },
        { name: 'AI Specialist / Live Assistant', targetPrimary: 'live-assistant', targetSecondary: '', category: 'AI' },
    ];

    const filtered = query.trim().length > 0 
        ? searchTargets.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()))
        : [];

    const handleSelect = (primary: string, secondary?: string) => {
        navigateTo(primary, secondary);
        setQuery('');
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filtered.length > 0) {
            handleSelect(filtered[0].targetPrimary, filtered[0].targetSecondary);
        }
    };

    return (
        <div className="relative w-full max-w-xs md:max-w-md hidden sm:block group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-3 w-3 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                onKeyDown={handleKeyDown}
                className="block w-full pl-9 pr-12 py-1.5 border border-white/10 rounded-sm bg-[#0A0A0A] text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 sm:text-[10px] font-mono"
                placeholder="SEARCH_POLYGON (e.g., Audit, Wallet, Gas, Threat)..."
            />
            <AnimatePresence>
                {isOpen && filtered.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-white/10 shadow-2xl z-50 p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        {filtered.map((item, idx) => (
                            <button
                                key={idx}
                                onMouseDown={() => handleSelect(item.targetPrimary, item.targetSecondary)}
                                className="w-full flex justify-between items-center p-2 hover:bg-white/5 text-left text-[9px] font-mono text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                <span>&gt; {item.name}</span>
                                <span className="text-[7px] text-gray-600 uppercase border border-white/10 px-1 py-0.5">{item.category}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', type: 'Security', title: 'High-Risk Contract', message: 'Interaction detected with 0x8f...2a.', timestamp: '2m ago', read: false },
        { id: '2', type: 'System', title: 'Gas Spike', message: 'Gas prices up 45%.', timestamp: '15m ago', read: false },
    ]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={containerRef}>
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-sm transition-all border border-transparent ${isOpen ? 'bg-white/10 text-white border-white/10' : 'text-gray-500 hover:text-white'}`}
            >
                <BellIcon className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-black"></span>
                )}
            </motion.button>
            
            <NotificationCenter 
                isOpen={isOpen}
                notifications={notifications}
                onClose={() => setIsOpen(false)}
                onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                onClearAll={() => setNotifications([])}
                onRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n))}
            />
        </div>
  );
};

export const HelpButton: React.FC = () => {
    return (
        <motion.button 
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-500 hover:text-white hidden sm:block" 
            onClick={() => window.dispatchEvent(new CustomEvent('start-dashboard-tour'))}
        >
            <HelpCircleIcon className="w-4 h-4" />
        </motion.button>
    );
};

export const SecurityTicker: React.FC = () => {
    const [index, setIndex] = useState(0);
    const alerts = [
        { type: 'Phishing', message: 'Fake mint detected', time: '2m' },
        { type: 'Exploit', message: 'High-risk tx flagged', time: '12m' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % alerts.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const current = alerts[index];

    return (
        <div className="hidden xl:flex items-center bg-[#0F0A0A] border border-red-900/30 px-3 py-1.5 overflow-hidden w-[220px] relative">
            <div className="flex items-center gap-3 w-full">
                <ThreatIcon className="w-3 h-3 text-red-500" />
                <div className="flex flex-col min-w-0 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={index}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                        >
                            <div className="flex justify-between items-center w-full">
                                <span className="text-[9px] font-bold text-red-500 uppercase font-mono">{current.type}</span>
                            </div>
                            <p className="text-[8px] text-gray-500 font-mono truncate">{current.message}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
