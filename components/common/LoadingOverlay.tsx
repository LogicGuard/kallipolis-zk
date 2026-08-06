
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberpunkLogo from '../landing/CyberpunkLogo';

const BOOT_MESSAGES = [
    "ESTABLISHING_ENCRYPTED_UPLINK",
    "INITIALIZING_HEURISTIC_KERNEL",
    "SYNCING_POLYGON_S1_NODES",
    "VERIFYING_PROTOCOL_INTEGRITY",
    "LOADING_GEMINI_PRO_MODELS",
    "SCANNING_MEMPOOL_VECTORS",
    "DECRYPTING_AGGLAYER_STREAM"
];

interface LoadingOverlayProps {
    message?: string;
    fullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message, fullScreen = true }) => {
    const [currentMsg, setCurrentMsg] = useState(BOOT_MESSAGES[0]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % BOOT_MESSAGES.length;
            setCurrentMsg(BOOT_MESSAGES[msgIndex]);
        }, 800);

        const progInterval = setInterval(() => {
            setProgress(prev => (prev < 90 ? prev + Math.random() * 15 : prev));
        }, 400);

        return () => {
            clearInterval(msgInterval);
            clearInterval(progInterval);
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${fullScreen ? 'fixed inset-0 z-[9999] bg-[#020202]' : 'absolute inset-0 z-50 bg-[#020202]/80 backdrop-blur-sm'} flex flex-col items-center justify-center overflow-hidden`}
        >
            {/* Background Grid Accent */}
            <div className="absolute inset-0 tech-bg opacity-[0.05]"></div>
            <div className="scanline"></div>

            <div className="relative flex flex-col items-center max-w-xs w-full">
                {/* Logo with pulse */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-12"
                >
                    <CyberpunkLogo className="scale-125" />
                </motion.div>

                {/* Progress Bar Container */}
                <div className="w-full h-1 bg-white/5 border border-white/10 rounded-full overflow-hidden mb-4 relative">
                    <motion.div 
                        className="absolute inset-y-0 left-0 bg-polygon-purple shadow-[0_0_15px_#7b3fe4]"
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                    />
                </div>

                {/* Status Messages */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] font-black">System_Status: Busy</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentMsg}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[11px] font-mono text-white font-bold uppercase tracking-widest text-center"
                        >
                            {message || currentMsg}...
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Corner Accents */}
                <div className="absolute -top-10 -left-10 w-20 h-20 border-t border-l border-white/5"></div>
                <div className="absolute -bottom-10 -right-10 w-20 h-20 border-b border-r border-white/5"></div>
            </div>

            {/* Matrix-like decorative digits */}
            <div className="absolute bottom-10 left-10 hidden lg:block opacity-10">
                <div className="text-[8px] font-mono text-gray-400 space-y-1">
                    <div>0x7B3FE4...INIT</div>
                    <div>AGGLAYER_LINK_STABLE</div>
                    <div>PKT_LOSS: 0.00%</div>
                </div>
            </div>
        </motion.div>
    );
};

export default LoadingOverlay;
