
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
    XIcon, ActivityIcon, CpuIcon, ShieldCheckIcon, 
    SettingsIcon, UserIcon, ZapIcon, RefreshIcon, 
    SearchIcon, BellIcon, TrashIcon, CheckCircleIcon
} from '../Icons';

const DownloadIcon = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

interface SidebarToolOverlayProps {
    activeTool: 'settings' | 'alerts' | 'terminal' | 'profile' | null;
    onClose: () => void;
}

const SidebarToolOverlay: React.FC<SidebarToolOverlayProps> = ({ activeTool, onClose }) => {
    const [currentTab, setCurrentTab] = useState(activeTool);
    const [logs, setLogs] = useState<{t: string, m: string, s: 'info' | 'warn' | 'crit' | 'sys'}[]>([]);
    const [commandValue, setCommandValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [systemLoad, setSystemLoad] = useState(42);
    const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Settings States
    const [settings, setSettings] = useState({
        stealthMode: false,
        deepPacketInspection: true,
        aggLayerSync: true,
        alertThreshold: 75
    });

    useEffect(() => {
        if (activeTool) setCurrentTab(activeTool);
    }, [activeTool]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSystemLoad(prev => Math.max(10, Math.min(95, prev + (Math.random() - 0.5) * 10)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Initial Logs
    useEffect(() => {
        if (logs.length === 0) {
            setLogs([
                { t: new Date().toLocaleTimeString(), m: "KERNEL_UPLINK_ESTABLISHED", s: "sys" },
                { t: new Date().toLocaleTimeString(), m: "WAITING_FOR_COMMAND...", s: "info" }
            ]);
        }
    }, []);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, isThinking]);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commandValue.trim()) return;

        const cmd = commandValue.toLowerCase().trim();
        setLogs(prev => [...prev, { t: new Date().toLocaleTimeString(), m: `> ${commandValue.toUpperCase()}`, s: "info" }]);
        setCommandValue('');
        setIsThinking(true);

        // Simulation of AI Intelligence processing
        await new Promise(r => setTimeout(r, 1200));

        let response = "";
        let severity: 'info' | 'warn' | 'crit' | 'sys' = 'info';

        if (cmd === 'help') {
            response = "AVAILABLE_COMMANDS: STATUS, CLEAR, SCAN_NETWORK, SHIELD_INIT, VERSION";
        } else if (cmd === 'status') {
            response = `KERNEL_STATUS: NOMINAL // CPU_LOAD: ${systemLoad.toFixed(1)}% // AGGLAYER: SYNCED`;
            severity = 'sys';
        } else if (cmd === 'scan_network') {
            response = "SCAN_COMPLETE: 1024 NODES VERIFIED. NO MALICIOUS SIGNATURES DETECTED.";
            severity = 'sys';
        } else if (cmd === 'shield_init') {
            response = "RE-INITIALIZING_MEMPOOL_FIREWALL... [SUCCESS]";
            severity = 'sys';
        } else if (cmd === 'clear') {
            setLogs([]);
            setIsThinking(false);
            return;
        } else {
            response = `COMMAND_NOT_RECOGNIZED: "${cmd.toUpperCase()}". TYPE 'HELP' FOR MANUAL.`;
            severity = 'warn';
        }

        setLogs(prev => [...prev, { t: new Date().toLocaleTimeString(), m: response, s: severity }]);
        setIsThinking(false);
    };

    const tabs = [
        { id: 'terminal', icon: ActivityIcon, label: 'Terminal', color: 'text-blue-500' },
        { id: 'alerts', icon: BellIcon, label: 'Security Vault', color: 'text-red-500' },
        { id: 'settings', icon: SettingsIcon, label: 'Core Config', color: 'text-purple-500' },
        { id: 'profile', icon: UserIcon, label: 'Auth Profile', color: 'text-green-500' },
    ];

    const renderTerminal = () => (
        <div className="flex flex-col h-full bg-black/20 font-mono text-[11px]">
            <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5 flex justify-between items-center text-[8px] font-black uppercase text-gray-500">
                <div className="flex gap-4">
                    <button onClick={() => setLogs([])} className="hover:text-red-400 transition-colors flex items-center gap-1.5">
                        <TrashIcon className="w-2.5 h-2.5" /> CLEAR
                    </button>
                    <button className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <DownloadIcon className="w-2.5 h-2.5" /> EXPORT
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-flicker"></div>
                    KERNEL_CONNECTED
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/[0.03] transition-colors pl-2 py-0.5 border-l border-transparent hover:border-white/5">
                        <span className="text-gray-700 opacity-30 select-none">[{log.t}]</span>
                        <span className={`font-black ${
                            log.s === 'crit' ? 'text-red-500' : 
                            log.s === 'warn' ? 'text-yellow-500' : 
                            log.s === 'sys' ? 'text-blue-400' : 'text-gray-500'
                        }`}>[{log.s.toUpperCase()}]</span>
                        <span className="text-gray-300">{log.m}</span>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex gap-3 pl-2 py-0.5 animate-pulse">
                        <span className="text-blue-500 font-black">AI_CORE:</span>
                        <span className="text-gray-600 italic">Thinking...</span>
                    </div>
                )}
                <div ref={terminalEndRef} />
            </div>
            <form onSubmit={handleCommand} className="p-2 border-t border-white/5 bg-black/40 flex items-center gap-3 px-4 group">
                <span className="text-blue-500 font-black text-xs group-focus-within:animate-pulse">{">"}</span>
                <input 
                    type="text" 
                    value={commandValue}
                    onChange={(e) => setCommandValue(e.target.value)}
                    placeholder="EXECUTE_KERNEL_COMMAND..." 
                    className="bg-transparent border-none focus:ring-0 text-[11px] text-white w-full placeholder-gray-800 font-mono" 
                />
            </form>
        </div>
    );

    const renderAlerts = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden">
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 h-full">
                {[
                    { id: 1, m: 'MALICIOUS_HANDSHAKE_DETECTION', s: 'CRIT', t: '14:02', details: 'Source: 0x921...E4. Method: Recursive Call Bypass attempt on Bridge V2.' },
                    { id: 2, m: 'MEMPOOL_THRESHOLD_GAS_SPIKE', s: 'WARN', t: '13:55', details: 'Congestion detected on Polygon Mainnet RPC. Potential MEV attack signature.' },
                    { id: 3, m: 'KERNEL_V4_CALIBRATION_OK', s: 'SYS', t: '12:12', details: 'Self-check complete. Heuristic confidence: 99.82%.' },
                ].map((alert) => (
                    <div 
                        key={alert.id} 
                        onClick={() => setSelectedAlert(alert.id)}
                        className={`p-3 border transition-all cursor-pointer relative overflow-hidden group ${
                            selectedAlert === alert.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.s === 'CRIT' ? 'bg-red-500' : alert.s === 'WARN' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-mono font-black text-white truncate pr-2 uppercase tracking-tighter">{alert.m}</span>
                            <span className="text-[8px] text-gray-600 font-mono">{alert.t}</span>
                        </div>
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Severity: {alert.s}</span>
                    </div>
                ))}
            </div>
            
            <div className="bg-white/[0.02] border border-white/10 p-4 font-mono flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
                <h4 className="text-[9px] font-black text-blue-500 uppercase mb-4 tracking-widest border-b border-white/5 pb-2">Forensic_Analysis</h4>
                <AnimatePresence mode="wait">
                    {selectedAlert ? (
                        <motion.div 
                            key={selectedAlert}
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="text-[10px] text-gray-300 leading-relaxed uppercase">
                                { [
                                    { id: 1, d: 'Source: 0x921...E4. Method: Recursive Call Bypass attempt on Bridge V2.' },
                                    { id: 2, d: 'Congestion detected on Polygon Mainnet RPC. Potential MEV attack signature.' },
                                    { id: 3, d: 'Self-check complete. Heuristic confidence: 99.82%.' }
                                ].find(a => a.id === selectedAlert)?.d }
                            </div>
                            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                                <div className="text-[7px] text-gray-600">VECTOR_ID: 0x98A</div>
                                <div className="text-[7px] text-gray-600">CONFIDENCE: 94%</div>
                            </div>
                            <Button variant="secondary" className="w-full !text-[8px] py-1">GENERATE_DOCKET</Button>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[9px] text-gray-700 uppercase italic">Select incident for forensics...</div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2 h-full overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                <div>
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-1">Uplink_Controls</h3>
                    <div className="space-y-3">
                        {[
                            { id: 'stealthMode', label: 'STEALTH_SIGNAL_MODE', desc: 'Mask RPC node footprints' },
                            { id: 'deepPacketInspection', label: 'DEEP_PACKET_INSPECT', desc: 'Full heuristic parsing' },
                            { id: 'aggLayerSync', label: 'AGGLAYER_REALTIME', desc: 'Zero-latency state tracking' },
                        ].map((s) => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 group hover:border-blue-500/20 transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white font-bold tracking-tighter">{s.label}</span>
                                    <span className="text-[7px] text-gray-600 uppercase">{s.desc}</span>
                                </div>
                                <button 
                                    onClick={() => setSettings(prev => ({ ...prev, [s.id]: !prev[s.id as keyof typeof settings] }))}
                                    className={`w-10 h-5 rounded-none relative transition-all border ${settings[s.id as keyof typeof settings] ? 'bg-blue-500/20 border-blue-500' : 'bg-white/5 border-white/10'}`}
                                >
                                    <motion.div 
                                        animate={{ x: settings[s.id as keyof typeof settings] ? 20 : 4 }}
                                        className={`absolute top-1 w-2 h-2 ${settings[s.id as keyof typeof settings] ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-gray-700'}`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-1">Heuristic_Sensitivity</h3>
                    <Card className="p-4 bg-black/40 border-white/5">
                        <div className="flex justify-between mb-4">
                            <span className="text-[8px] font-mono text-gray-400 uppercase">Detection_Threshold</span>
                            <span className="text-[10px] font-mono text-blue-400 font-black">{settings.alertThreshold}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={settings.alertThreshold}
                            onChange={(e) => setSettings(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-white/5 appearance-none cursor-pointer accent-blue-500" 
                        />
                        <div className="flex justify-between mt-2 text-[6px] font-mono text-gray-700 uppercase">
                            <span>Permissive</span>
                            <span>Strict_Security</span>
                        </div>
                    </Card>
                </div>
                <Button className="w-full !py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] group">
                    <RefreshIcon className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    APPLY_CHANGES
                </Button>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {activeTool && (
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 lg:left-[288px] h-[35vh] min-h-[340px] max-h-[60vh] bg-[#020202]/98 backdrop-blur-3xl border-t border-white/10 z-[110] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex flex-col"
                >
                    {/* IDE Resizer Handle Decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-4 py-1 bg-white/5 border border-white/10 border-b-0 rounded-t-md opacity-20 hover:opacity-100 transition-opacity cursor-ns-resize hidden lg:block">
                        <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
                    </div>

                    {/* Dock Header */}
                    <div className="flex items-center justify-between px-6 py-1.5 border-b border-white/5 bg-[#0A0A0A]/80 flex-shrink-0">
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setCurrentTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 text-[9px] font-mono font-black uppercase transition-all relative group ${
                                        currentTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 ${currentTab === tab.id ? tab.color : 'opacity-40'}`} />
                                    <span>{tab.label}</span>
                                    {currentTab === tab.id && (
                                        <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-4 border-l border-white/10 pl-4 h-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[7px] text-gray-600 uppercase font-black">AI_INFERENCE_LOAD</span>
                                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-blue-500" animate={{ width: `${systemLoad}%` }} />
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/5 text-gray-500 hover:text-white transition-all rounded-sm">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Dock Content Viewport */}
                    <div className="flex-1 overflow-hidden bg-black/40 relative">
                        <div className="absolute inset-0 tech-bg opacity-[0.02] pointer-events-none"></div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full p-4"
                            >
                                {currentTab === 'terminal' && renderTerminal()}
                                {currentTab === 'alerts' && renderAlerts()}
                                {currentTab === 'settings' && renderSettings()}
                                {currentTab === 'profile' && (
                                    <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center space-y-6">
                                        <div className="w-20 h-20 bg-[#020202] border border-blue-500/40 p-1 flex items-center justify-center relative group">
                                            <UserIcon className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#020202] rounded-full animate-pulse"></div>
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-mono font-black text-white uppercase tracking-widest mb-1">Operator_Alpha_01</h2>
                                            <p className="text-[9px] text-gray-500 font-mono uppercase">Level: Institutional_Sovereign // ID: OP_9912</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="p-3 border border-white/5 bg-white/[0.01]">
                                                <div className="text-[7px] text-gray-600 uppercase font-black mb-1">Trust_Index</div>
                                                <div className="text-xs font-mono text-green-500 font-bold">99.82%</div>
                                            </div>
                                            <div className="p-3 border border-white/5 bg-white/[0.01]">
                                                <div className="text-[7px] text-gray-600 uppercase font-black mb-1">Session_TTL</div>
                                                <div className="text-xs font-mono text-blue-400 font-bold">04:12:00</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dock Status Bar */}
                    <div className="px-6 py-1 border-t border-white/5 bg-[#050505] flex justify-between items-center text-[7px] font-mono text-gray-700 uppercase tracking-widest flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-green-500 rounded-full animate-flicker"></div>
                                Link: Sustained
                            </span>
                            <span className="hidden sm:inline">Region: Polygon_S1_Asia</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2">
                                <CheckCircleIcon className="w-2.5 h-2.5 text-blue-500" />
                                Integrity_Verified
                            </span>
                            <span className="text-blue-500/40 font-black">KALLIPOLIS_DOCK_V4</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SidebarToolOverlay;
