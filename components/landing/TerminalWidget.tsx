
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LOG_LINES = [
    { type: 'SYS', text: "INIT_UPLINK: KALLIPOLIS_ZK_S1_SECURE", color: "text-white" },
    { type: 'SIG', text: "HANDSHAKE: AGGLAYER_V1_ESTABLISHED", color: "text-blue-400" },
    { type: 'NET', text: "LATENCY: 12ms // PACKET_LOSS: 0.00%", color: "text-gray-500" },
    { type: 'MOD', text: "KERNEL_LOAD: GEMINI_3_PRO_ACTIVE", color: "text-purple-400" },
    { type: 'SEC', text: "MEMPOOL_SHIELD: SURVEILLANCE_ACTIVE", color: "text-blue-400" },
    { type: 'BLK', text: "INGESTING_BLOCK: #54,921,024", color: "text-gray-600" },
    { type: 'INF', text: "SCANNING_TX: 0x7f8...9a2e", color: "text-gray-500" },
    { type: 'WRN', text: "ANOMALY: RECURSIVE_CALL_PATTERN", color: "text-yellow-500 font-black" },
    { type: 'CRT', text: "THREAT_ID: REENTRANCY_VECTOR_09", color: "text-red-500 font-black" },
    { type: 'ACT', text: "MITIGATION: TX_QUARANTINED", color: "text-green-500" },
    { type: 'BLK', text: "INGESTING_BLOCK: #54,921,025", color: "text-gray-600" },
    { type: 'INF', text: "STATE_SYNC: NOMINAL", color: "text-white opacity-80" }
];

const TerminalWidget: React.FC = () => {
    const [lines, setLines] = useState<typeof LOG_LINES>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            const nextLine = LOG_LINES[currentIndex % LOG_LINES.length];
            setLines(prev => {
                const newLines = [...prev, { ...nextLine, id: Date.now() + Math.random() }];
                if (newLines.length > 16) return newLines.slice(newLines.length - 16);
                return newLines;
            });
            currentIndex++;
        }, 700);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="w-full max-w-lg mx-auto font-mono text-xs z-10 relative">
            {/* Header HUD / Tactical Top */}
            <div className="flex justify-between items-center bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 px-4 py-2 border-b-0 rounded-t-sm">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-polygon-purple rounded-full animate-pulse shadow-[0_0_8px_#7b3fe4]"></div>
                    <span className="text-[9px] text-gray-400 tracking-[0.3em] font-black uppercase">Core_Telemetry // S1-UPLINK</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-[8px] text-gray-600 uppercase">NODE: 0x7B...E4</span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-sm"></div>
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-sm"></div>
                    </div>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="relative bg-[#020202]/80 backdrop-blur-sm border border-white/10 h-72 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Visual Overlays */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] tech-bg"></div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent animate-scanline"></div>
                
                <div 
                    ref={scrollRef}
                    className="p-5 h-full overflow-y-auto custom-scrollbar relative z-10 space-y-1.5"
                >
                    {lines.map((line, i) => (
                        <motion.div 
                            key={(line as any).id || i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${line.color} flex gap-3 items-baseline`}
                        >
                            <span className="text-[8px] opacity-20 select-none flex-shrink-0 font-black">
                                {new Date().toISOString().split('T')[1].split('.')[0]}
                            </span>
                            <span className="text-[9px] font-black opacity-40 bg-white/5 px-1 rounded-sm min-w-[32px] text-center uppercase tracking-tighter">
                                {line.type}
                            </span>
                            <span className="tracking-tight text-[11px] font-mono leading-none">{line.text}</span>
                        </motion.div>
                    ))}
                    
                    {/* Active Input Line */}
                    <div className="flex items-center text-white mt-4 border-t border-white/5 pt-3">
                        <span className="mr-2 text-polygon-purple font-black text-xs">{">"}</span>
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mr-2 animate-pulse">Awaiting_Command_Ingest</span>
                        <motion.div 
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-1.5 h-3 bg-white shadow-[0_0_8px_white]"
                        />
                    </div>
                </div>
            </div>
            
            {/* Tactical Footer / Stats Strip */}
            <div className="flex justify-between items-center bg-[#080808]/90 backdrop-blur-md border border-white/10 border-t-0 px-4 py-2 text-[9px] text-gray-500 font-mono uppercase font-black tracking-widest rounded-b-sm">
                <div className="flex gap-5">
                    <span className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        NET: 1.2 GB/S
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        CPU: 08%
                    </span>
                </div>
                <span className="text-polygon-purple-light opacity-60">AES_256_ACTIVE</span>
            </div>

            {/* Corner Decorative Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white/20 pointer-events-none"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white/20 pointer-events-none"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white/20 pointer-events-none"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white/20 pointer-events-none"></div>

            <style>{`
                @keyframes scanline-anim {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .animate-scanline {
                    animation: scanline-anim 8s linear infinite;
                    height: 100%;
                }
            `}</style>
        </div>
    );
};

export default TerminalWidget;
