
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import { getSecurityAlerts, getOnChainEvents, systemStatusEvents, getSystemStatus } from '../../services/geminiService';
import { SecurityAlert, OnChainEvent } from '../../types';
import { OnChainIcon, ThreatIcon, LightbulbIcon, BridgeIcon, DAOIcon, GasIcon, FirewallIcon, TransactionIcon, ActivityIcon, ShieldCheckIcon, RefreshIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';
import { ListSkeleton } from '../common/Loader';

const MAX_ITEMS = 40; 
// Polling interval significantly increased and randomized to avoid synchronous quota bursts
const POLL_INTERVAL_BASE = 150000; // Increased to 2.5 minutes base

const INITIAL_ALERTS: SecurityAlert[] = [
    {
        id: 'alt_01',
        title: 'UNVERIFIED_PROXY_IMPLEMENTATION_DETECTED',
        severity: 'Warning',
        description: 'New ERC-1967 transparent proxy deployed on Polygon PoS without verified source code on Polygonscan.',
        timestamp: new Date().toISOString()
    },
    {
        id: 'alt_02',
        title: 'AGGLAYER_EXIT_ROOT_BATCH_PROOF_VERIFIED',
        severity: 'Info',
        description: 'Unified LxLy bridge batch proof verified by ZK Prover engine with 0 nullifier conflicts.',
        timestamp: new Date(Date.now() - 45000).toISOString()
    },
    {
        id: 'alt_03',
        title: 'MEV_SANDWICH_PATTERN_INTERCEPTED',
        severity: 'Critical',
        description: 'Pre-execution RPC firewall blocked a high-gas frontrunning attempt targeting QuickSwap pool.',
        timestamp: new Date(Date.now() - 120000).toISOString()
    }
];

const INITIAL_EVENTS: OnChainEvent[] = [
    {
        id: 'evt_01',
        type: 'Flash Loan',
        details: '1,200,000 POL Flash Loan borrowed from Aave V3. Transaction simulation completed nominal.',
        address: '0x35f...82A1',
        timestamp: new Date().toISOString()
    },
    {
        id: 'evt_02',
        type: 'Bridge Transfer',
        details: '250,000 USDC bridged from Ethereum L1 to Polygon zkEVM via LxLy Exit Root.',
        address: '0xA0b...eB48',
        timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
        id: 'evt_03',
        type: 'Contract Deployment',
        details: 'Bytecode initialized at 0x71C...49A2. Slither security scan score: 96/100.',
        address: '0x71C...49A2',
        timestamp: new Date(Date.now() - 180000).toISOString()
    }
];

const RealTimeMonitor: React.FC = () => {
    const { navigateTo } = useNavigation();
    const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
    const [events, setEvents] = useState<OnChainEvent[]>(INITIAL_EVENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'alerts' | 'events'>('alerts');
    const [searchQuery, setSearchQuery] = useState('');
    const [inspectedItem, setInspectedItem] = useState<SecurityAlert | OnChainEvent | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isCongested, setIsCongested] = useState(getSystemStatus().isCoolingDown);
    const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTING');

    useEffect(() => {
        // Connect to WebSocket Server (Real-Time Infrastructure Upgrade)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        let ws: WebSocket;
        
        try {
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                setWsStatus('CONNECTED');
                setIsLoading(false);
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'MEMPOOL_EVENT') {
                        const newEvent: OnChainEvent = {
                            id: data.data.txHash.slice(0, 10),
                            type: data.data.riskScore === 'HIGH' ? 'Flash Loan' : 'High-Value Transfer',
                            details: `Gas: ${data.data.gasPrice} Gwei | Tx: ${data.data.txHash}`,
                            address: data.data.txHash.slice(0, 6) + '...' + data.data.txHash.slice(-4),
                            timestamp: new Date(data.data.timestamp).toISOString()
                        };
                        
                        setEvents(prev => [newEvent, ...prev].slice(0, MAX_ITEMS));
                        
                        if (data.data.riskScore === 'HIGH') {
                             const newAlert: SecurityAlert = {
                                id: 'alt_' + Date.now().toString().slice(-4),
                                severity: 'Critical',
                                title: 'HIGH_RISK_MEMPOOL_TX_DETECTED',
                                description: `Transaction ${data.data.txHash} exhibits sandwich or flash loan exploit characteristics.`,
                                timestamp: new Date().toISOString()
                             };
                             setAlerts(prev => [newAlert, ...prev].slice(0, MAX_ITEMS));
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse WS message", e);
                }
            };
            
            ws.onclose = () => {
                setWsStatus('DISCONNECTED');
            };

            ws.onerror = () => {
                setWsStatus('DISCONNECTED');
            };
        } catch (error) {
            console.error("WebSocket setup failed", error);
            setWsStatus('DISCONNECTED');
        }

        return () => {
            if (ws) {
                ws.onopen = null;
                ws.onmessage = null;
                ws.onerror = null;
                ws.onclose = null;
                
                try {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    } else if (ws.readyState === WebSocket.CONNECTING) {
                        ws.addEventListener('open', () => {
                            try { ws.close(); } catch (_) {}
                        }, { once: true });
                    }
                } catch (_) {}
            }
        };
    }, []);

    useEffect(() => {
        const handleStatusChange = (e: any) => {
            setIsCongested(e.detail.isCoolingDown);
        };
        systemStatusEvents.addEventListener('statusChange', handleStatusChange);
        return () => systemStatusEvents.removeEventListener('statusChange', handleStatusChange);
    }, []);

    const fetchData = useCallback(async (isInitial = false) => {
        if (getSystemStatus().isCoolingDown) {
            console.debug("Fetch suppressed: System in cooldown");
            return;
        }
        
        if (isInitial) setIsLoading(true);
        else setIsRefreshing(true);
        
        setError(null);
        try {
            const [alertsResult, eventsResult] = await Promise.all([
                getSecurityAlerts(),
                getOnChainEvents()
            ]);
            
            if (Array.isArray(alertsResult.data)) {
                const alertsList = alertsResult.data;
                setAlerts(prev => {
                    const newItems = alertsList.filter(n => n && typeof n === 'object' && n.id && !prev.some(p => p.id === n.id));
                    return [...newItems, ...prev].slice(0, MAX_ITEMS);
                });
            }
            if (Array.isArray(eventsResult.data)) {
                const eventsList = eventsResult.data;
                setEvents(prev => {
                    const newItems = eventsList.filter(n => n && typeof n === 'object' && n.id && !prev.some(p => p.id === n.id));
                    return [...newItems, ...prev].slice(0, MAX_ITEMS);
                });
            }

            if (alertsResult.error || eventsResult.error) {
                const err = alertsResult.error || eventsResult.error;
                if (!err?.includes('QUOTA')) {
                    setError(err);
                }
            }
        } catch (e) {
            console.error("Monitor fetch error", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch with a more aggressive random delay to stagger with other component mounts
        const delay = 1000 + Math.random() * 5000;
        const timer = setTimeout(() => fetchData(true), delay);
        return () => clearTimeout(timer);
    }, [fetchData]);

    useEffect(() => {
        const scheduleNext = () => {
            const jitter = Math.random() * 60000; // 1 minute jitter
            return setTimeout(() => {
                if (!getSystemStatus().isCoolingDown && !isPaused) {
                    fetchData();
                }
                scheduleNext();
            }, POLL_INTERVAL_BASE + jitter);
        };

        const timer = scheduleNext();
        return () => clearTimeout(timer);
    }, [fetchData, isPaused]);

    const formatTimeAgo = (isoString: string) => {
        try {
            const date = new Date(isoString);
            const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            if (seconds < 60) return `${seconds}s`;
            const minutes = Math.floor(seconds / 60);
            return `${minutes}m`;
        } catch (e) {
            return 'now';
        }
    };

    const getAlertStyles = (severity: SecurityAlert['severity']) => {
        switch (severity) {
            case 'Info': return { Icon: LightbulbIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            case 'Warning': return { Icon: ThreatIcon, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
            case 'Critical': return { Icon: FirewallIcon, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            default: return { Icon: LightbulbIcon, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };
    
    const getEventStyles = (type: OnChainEvent['type']) => {
        switch (type) {
            case 'Contract Deployment': return { Icon: OnChainIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
            case 'High-Value Transfer': return { Icon: TransactionIcon, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            case 'DAO Vote': return { Icon: DAOIcon, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };
            case 'Flash Loan': return { Icon: GasIcon, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
            case 'Bridge Transfer': return { Icon: BridgeIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
            default: return { Icon: OnChainIcon, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };

    const renderList = (items: (SecurityAlert | OnChainEvent)[]) => {
        const filteredItems = items.filter(item => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            const isAlert = 'severity' in item;
            const title = isAlert ? (item as SecurityAlert).title : (item as OnChainEvent).type;
            const desc = isAlert ? (item as SecurityAlert).description : (item as OnChainEvent).details;
            return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
        });

        return (
            <div className="space-y-1.5 pr-1.5 h-full overflow-y-auto custom-scrollbar pb-4 flex flex-col relative">
                <AnimatePresence initial={false}>
                    {filteredItems.map((item, idx) => {
                        if (!item) return null;
                        const isAlert = 'severity' in item;
                        const { color, bg, border, Icon } = isAlert 
                            ? getAlertStyles((item as SecurityAlert).severity) 
                            : getEventStyles((item as OnChainEvent).type);
                        
                        const title = isAlert ? (item as SecurityAlert).title : (item as OnChainEvent).type;
                        const description = isAlert ? (item as SecurityAlert).description : (item as OnChainEvent).details;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className={`flex flex-col gap-2 p-3 rounded-sm border ${border} ${bg} bg-opacity-[0.02] hover:bg-opacity-[0.06] transition-all group cursor-pointer relative overflow-hidden`}
                                onClick={() => setInspectedItem(item)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1 rounded-sm ${bg} bg-opacity-20 flex-shrink-0`}>
                                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${color} truncate`}>
                                                {title}
                                            </span>
                                            <span className="text-[8px] font-mono text-gray-600 font-bold uppercase ml-2">{formatTimeAgo(item.timestamp)}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 leading-tight font-mono line-clamp-2">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[7.5px] font-mono text-gray-500 uppercase">ID: #{item.id}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInspectedItem(item);
                                        }}
                                        className="text-[8px] font-mono font-black uppercase px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5"
                                    >
                                        Inspect Signal
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {filteredItems.length === 0 && !isLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-16 text-center">
                         <ActivityIcon className="w-8 h-8 mb-2 text-gray-600" />
                         <span className="text-[9px] font-mono uppercase text-gray-500 tracking-[0.2em]">No matching signals found</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="p-0 h-full flex flex-col bg-[#050505] tactical-border shadow-2xl min-h-0 relative">
            {isRefreshing && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-20 pointer-events-none flex items-center justify-center">
                    <div className="px-4 py-2 bg-black/60 border border-white/10 text-[9px] font-mono text-blue-400 font-black uppercase tracking-widest animate-pulse">
                        Refreshing_Buffer...
                    </div>
                </div>
            )}

            <div className="p-3 border-b border-white/5 flex flex-col gap-2 bg-[#080808] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isCongested ? 'bg-red-500' : isPaused ? 'bg-yellow-500' : 'bg-green-500'} animate-flicker shadow-[0_0_8px_currentColor]`}></div>
                        <h2 className="text-[10px] font-mono font-black uppercase text-white tracking-[0.3em]">
                            Signal_Stream
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => fetchData()}
                            disabled={isRefreshing || isCongested}
                            className={`p-1.5 rounded-sm transition-all ${isRefreshing ? 'opacity-50' : 'hover:bg-white/5 text-gray-500 hover:text-white'}`}
                            title="Force Refresh"
                        >
                            <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex gap-1 bg-black/40 p-1 rounded-sm border border-white/5">
                            {['alerts', 'events'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-2 py-1 text-[8px] font-mono font-black uppercase transition-all ${activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Search Filter */}
                <div className="relative">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH_SIGNALS_BY_KEYWORD_OR_HASH..."
                        className="w-full bg-black/60 border border-white/5 text-[8.5px] font-mono text-white placeholder-gray-600 px-2.5 py-1 focus:outline-none focus:border-blue-500/40 uppercase tracking-widest"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1 text-[8px] font-mono text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
            
            <div className="p-4 flex-1 min-h-0 bg-[#030303] relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-10"></div>
                {!isLoading && !isCongested && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full min-h-0 flex flex-col"
                        >
                            {activeTab === 'alerts' ? renderList(alerts) : renderList(events)}
                        </motion.div>
                    </AnimatePresence>
                )}
                {isLoading && !isCongested && <ListSkeleton items={6} className="mt-2" />}
                {isCongested && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-red-950/10 m-2 border border-red-500/20">
                        <ThreatIcon className="w-8 h-8 text-red-500 mb-4 animate-pulse" />
                        <span className="text-[10px] font-mono text-red-400 font-black uppercase tracking-widest leading-relaxed">
                            QUOTA_THRESHOLD: Signal stream throttled.
                        </span>
                        <span className="text-[8px] text-gray-600 font-mono mt-2 uppercase italic tracking-tighter">System is cooling down to prevent lock-out.</span>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-6 text-[9px] font-mono text-blue-400 hover:text-white border border-blue-500/20 px-4 py-2 hover:bg-blue-500/10 transition-all uppercase font-black"
                        >
                            Reset_Kernel
                        </button>
                    </div>
                )}
            </div>
            
            <div className="p-2 border-t border-white/5 bg-black/80 backdrop-blur-md flex justify-between items-center text-[7px] font-mono text-gray-700 uppercase tracking-widest flex-shrink-0">
                 <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-2.5 h-2.5 text-blue-500" />
                    Handshake Status: {wsStatus} // 12ms Latency
                 </div>
                 <span>P_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>

            {/* SIGNAL INSPECTION MODAL */}
            <AnimatePresence>
                {inspectedItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-5 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2.5">
                                <ThreatIcon className="w-4 h-4 text-blue-400" />
                                <div>
                                    <h3 className="text-xs font-mono font-black text-white tracking-widest uppercase">
                                        {'severity' in inspectedItem ? inspectedItem.title : inspectedItem.type}
                                    </h3>
                                    <span className="text-[8px] font-mono text-gray-500 uppercase">
                                        Signal ID: #{inspectedItem.id} // Polygon Telemetry
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setInspectedItem(null)}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[8px] font-mono font-black uppercase"
                            >
                                CLOSE [ESC]
                            </button>
                        </div>

                        <div className="my-3 space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                                <span className="text-[7.5px] font-mono text-gray-500 uppercase font-black">Description & Payload</span>
                                <p className="text-[10px] font-mono text-gray-300 leading-relaxed">
                                    {'severity' in inspectedItem ? inspectedItem.description : inspectedItem.details}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 bg-white/[0.02] border border-white/5 space-y-0.5">
                                    <span className="text-[7px] font-mono text-gray-500 uppercase font-black">Timestamp</span>
                                    <div className="text-[9px] font-mono text-white">{new Date(inspectedItem.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <div className="p-2.5 bg-white/[0.02] border border-white/5 space-y-0.5">
                                    <span className="text-[7px] font-mono text-gray-500 uppercase font-black">Risk Severity</span>
                                    <div className="text-[9px] font-mono text-blue-400 font-bold uppercase">
                                        {'severity' in inspectedItem ? inspectedItem.severity : 'Nominal Event'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-2.5 bg-black/80 border border-white/5 font-mono text-[8px] text-gray-400 space-y-1">
                                <div className="text-gray-500 font-black uppercase text-[7px]">Simulated Mitigation Code</div>
                                <div className="text-blue-400/90 selection:bg-blue-500/20">
                                    {`// Kallipolis ZK Firewall Defense
function enforceShield(address target) external {
    require(!isBlacklisted(target), "BLOCKED_BY_FIREWALL");
}`}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-white/10">
                            <button 
                                onClick={() => {
                                    setInspectedItem(null);
                                    navigateTo('real-time-security', 'transaction-analysis');
                                }}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[8.5px] font-black uppercase tracking-widest transition-all"
                            >
                                Open Full Inspector
                            </button>
                            <button 
                                onClick={() => {
                                    setInspectedItem(null);
                                    navigateTo('real-time-security', 'smart-contract-firewall');
                                }}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-mono text-[8.5px] font-black uppercase tracking-widest transition-all"
                            >
                                Block In Firewall
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default RealTimeMonitor;
