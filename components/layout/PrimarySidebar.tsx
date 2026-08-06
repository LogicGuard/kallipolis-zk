
import React, { useState, useEffect } from 'react';
import { NavItem } from '../../types';
import CyberpunkLogo from '../landing/CyberpunkLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GlobeIcon, WalletIcon, ChevronDownIcon, SearchIcon, 
    ZapIcon, ActivityIcon, CpuIcon, ShieldCheckIcon, 
    SettingsIcon, UserIcon, BellIcon, MicIcon 
} from '../Icons';
import { useWallet } from '../../context/WalletContext';
import { useNavigation } from '../../context/NavigationContext';
import SidebarToolOverlay from './SidebarToolOverlay';

interface PrimarySidebarProps {
  items: NavItem[];
  activeItem: string;
  activeSubItem: string;
  onItemClick: (id: string) => void;
  onSubItemClick: (id: string) => void;
}

const PrimarySidebar: React.FC<PrimarySidebarProps> = ({ items, activeItem, activeSubItem, onItemClick, onSubItemClick }) => {
  const { account } = useWallet();
  const { navigateTo } = useNavigation();
  const [time, setTime] = useState(new Date());
  const [activeOverlay, setActiveOverlay] = useState<'settings' | 'alerts' | 'terminal' | 'profile' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExecuteCmd = (cmd: string) => {
      setSearchQuery('');
      setIsSearchFocused(false);
      if (cmd === 'AUDIT_CONTRACT') {
          navigateTo('security-audits', 'smart-contract-auditor');
      } else if (cmd === 'SCAN_MEMPOOL') {
          navigateTo('real-time-security', 'transaction-analysis');
      } else if (cmd === 'NETWORK_TRAFFIC') {
          navigateTo('real-time-security', 'on-chain-monitor');
      }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const toggleOverlay = (tool: 'settings' | 'alerts' | 'terminal' | 'profile') => {
      setActiveOverlay(prev => prev === tool ? null : tool);
  };

  return (
    <div className="relative flex h-full">
      <aside className="w-20 lg:w-72 bg-[#020202] border-r border-white/5 flex flex-col items-center lg:items-start flex-shrink-0 z-[100] transition-all duration-500 relative overflow-hidden group/sidebar">
        {/* Advanced Background Gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] tech-bg"></div>
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-blue-500/40 via-transparent to-purple-500/40 opacity-30"></div>
        
        {/* 1. CORE BRANDING & SMART COMMANDS */}
        <div className="w-full p-6 space-y-6 relative z-10">
          <div className="flex items-center justify-between">
             <CyberpunkLogo hideText={true} className="scale-110 lg:scale-125 origin-left" />
             <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-none shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_#3b82f6]"></div>
                <span className="text-[7px] font-mono text-blue-400 font-black uppercase tracking-widest">S1_Operational</span>
             </div>
          </div>

          {/* Smart Command Hub */}
          <div className="hidden lg:block relative group/search">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearchFocused ? 'text-blue-500' : 'text-gray-600'}`}>
                  <SearchIcon className="w-3 h-3" />
              </div>
              <input 
                  type="text" 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="EXECUTE_COMMAND..." 
                  className="w-full bg-white/[0.02] border border-white/5 py-2.5 pl-10 pr-4 text-[9px] font-mono text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
              />
              
              <AnimatePresence>
                {isSearchFocused && searchQuery.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-white/10 shadow-2xl z-50 p-2 overflow-hidden"
                    >
                        <div className="text-[7px] font-mono text-gray-600 uppercase mb-2 px-2">Heuristic_Predictions</div>
                        {['AUDIT_CONTRACT', 'SCAN_MEMPOOL', 'NETWORK_TRAFFIC'].filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map((cmd, i) => (
                            <button key={i} onClick={() => handleExecuteCmd(cmd)} className="w-full text-left p-2 hover:bg-white/5 text-[8px] font-mono text-gray-400 hover:text-blue-400 transition-colors uppercase font-black">
                                &gt; {cmd}
                            </button>
                        ))}
                    </motion.div>
                )}
              </AnimatePresence>
          </div>
        </div>
        
        {/* 2. NAVIGATION NODES */}
        <nav className="flex flex-col w-full px-3 overflow-y-auto custom-scrollbar flex-1 py-2 space-y-1 relative z-10">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`flex items-center justify-center lg:justify-start gap-4 p-3.5 rounded-none transition-all duration-300 relative w-full group overflow-hidden ${
                    isActive ? 'bg-white/[0.04] text-white shadow-[inset_4px_0_0_#3b82f6]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className={`relative z-10 flex items-center justify-center transition-all duration-500 ${isActive ? 'text-blue-400 scale-110' : 'group-hover:text-white'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="hidden lg:flex flex-col flex-1 z-10 min-w-0">
                      <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-black transition-all ${isActive ? 'translate-x-1' : 'opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5'}`}>
                          {item.label}
                      </span>
                  </div>

                  {hasSubItems && (
                    <ChevronDownIcon className={`hidden lg:block w-3 h-3 text-gray-700 transition-transform duration-300 z-10 ${isActive ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                <AnimatePresence>
                  {isActive && hasSubItems && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-black/20"
                    >
                      <div className="pl-11 py-2 border-l border-white/5 ml-5 space-y-1">
                          {item.subItems?.map(sub => (
                              <button
                                  key={sub.id}
                                  onClick={() => onSubItemClick(sub.id)}
                                  className={`w-full flex items-center gap-3 py-2 text-left transition-colors relative group/sub`}
                              >
                                  <div className={`w-1 h-1 rounded-none rotate-45 transition-all ${activeSubItem === sub.id ? 'bg-blue-400 scale-150 shadow-[0_0_8px_#3b82f6]' : 'bg-gray-800'}`}></div>
                                  <span className={`text-[8px] font-mono uppercase tracking-widest font-black hidden lg:block ${activeSubItem === sub.id ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}>
                                    {sub.label}
                                  </span>
                              </button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        
        {/* 3. TACTICAL UTILITY FOOTER */}
        <div className="w-full mt-auto relative z-20">
           {/* Bottom Utility Grid */}
           <div className="w-full grid grid-cols-4 border-t border-white/5 bg-[#050505]">
               {[
                   { icon: SettingsIcon, label: 'Settings', id: 'settings' },
                   { icon: BellIcon, label: 'Alerts', id: 'alerts' },
                   { icon: ActivityIcon, label: 'Terminal', id: 'terminal' },
                   { icon: UserIcon, label: 'Profile', id: 'profile' }
               ].map((tool) => (
                   <button 
                      key={tool.id}
                      onClick={() => toggleOverlay(tool.id as any)}
                      title={tool.label}
                      className={`flex flex-col items-center justify-center py-4 border-r border-white/5 transition-all relative overflow-hidden group ${
                         activeOverlay === tool.id ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'
                      }`}
                   >
                      {activeOverlay === tool.id && (
                          <motion.div layoutId="toolActiveGlow" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <tool.icon className={`w-3.5 h-3.5 transition-colors duration-300 ${activeOverlay === tool.id ? 'text-blue-400 scale-110' : 'text-gray-600 group-hover:text-blue-400'}`} />
                      <span className={`hidden lg:block text-[6px] font-mono mt-1.5 uppercase font-black transition-colors ${activeOverlay === tool.id ? 'text-white' : 'text-gray-700 group-hover:text-gray-400'}`}>{tool.id}</span>
                   </button>
               ))}
           </div>

           {/* System Telemetry Metadata */}
           <div className="p-3 px-6 flex justify-between items-center bg-[#000] text-[6px] font-mono text-gray-700 uppercase tracking-[0.4em] border-t border-white/5">
               <span className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-green-500 rounded-full animate-flicker"></div>
                   SYSTEM_OK
               </span>
               <span className="text-gray-800 font-black">{formatTime(time)}</span>
           </div>
        </div>
      </aside>

      <SidebarToolOverlay activeTool={activeOverlay} onClose={() => setActiveOverlay(null)} />
    </div>
  );
};

export default PrimarySidebar;
