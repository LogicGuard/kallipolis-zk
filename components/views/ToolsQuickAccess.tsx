
import React from 'react';
import Card from '../common/Card';
import { motion } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';
import { WalletIcon, FirewallIcon, AuditorIcon, TransactionIcon, PlusIcon } from '../Icons';

const TOOLS = [
    { label: 'WALLET_DOSSIER', icon: WalletIcon, pid: 'asset-intelligence', sid: 'wallet-report', desc: 'Scan Identity' },
    { label: 'TX_INSPECTOR', icon: TransactionIcon, pid: 'real-time-security', sid: 'transaction-analysis', desc: 'Decode Signals' },
    { label: 'FIREWALL_CORE', icon: FirewallIcon, pid: 'real-time-security', sid: 'smart-contract-firewall', desc: 'Simulate Shield' },
    { label: 'AUDIT_KERNEL', icon: AuditorIcon, pid: 'security-audits', sid: 'smart-contract-auditor', desc: 'Verify Logic' },
];

const ToolsQuickAccess: React.FC = () => {
    const { navigateTo } = useNavigation();
    return (
        <Card className="bg-[#080808]/80 backdrop-blur-md p-2 border-white/5 flex items-center gap-2 shadow-2xl rounded-none relative overflow-hidden">
            {/* HUD Decoration */}
            <div className="absolute top-0 left-0 w-24 h-[1px] bg-blue-500 opacity-50"></div>
            
            <div className="px-4 border-r border-white/10 flex flex-col justify-center mr-2">
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] font-mono">Operations</span>
                <span className="text-[10px] font-black text-white uppercase font-mono tracking-tighter">QUICK_START</span>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                {TOOLS.map((tool, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                        onClick={() => navigateTo(tool.pid, tool.sid)}
                        className="flex items-center gap-3 p-2.5 border border-white/5 text-left group transition-all relative overflow-hidden"
                    >
                        <div className="p-1.5 bg-white/5 rounded-sm group-hover:bg-blue-500/10 transition-colors">
                            <tool.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-white font-mono truncate uppercase tracking-widest">{tool.label}</span>
                            <span className="text-[7px] font-mono text-gray-600 uppercase group-hover:text-gray-400 transition-colors">{tool.desc}</span>
                        </div>
                        {/* Interactive Sparkle */}
                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlusIcon className="w-2 h-2 text-blue-500/50" />
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="hidden lg:flex px-4 border-l border-white/10 flex-col items-end">
                <span className="text-[8px] font-mono text-gray-600 uppercase">Handshake</span>
                <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>)}
                </div>
            </div>
        </Card>
    );
};

export default ToolsQuickAccess;
