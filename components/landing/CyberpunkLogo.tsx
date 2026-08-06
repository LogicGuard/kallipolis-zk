import React from 'react';
// FIX: Imported Variants type from framer-motion for explicit configuration typing.
import { motion, Variants } from 'framer-motion';

interface CyberpunkLogoProps {
    className?: string;
    hideText?: boolean;
}

const CyberpunkLogo: React.FC<CyberpunkLogoProps> = ({ className = "", hideText = false }) => {
    const polyPart = "Kallipolis";
    const guardPart = "ZK";

    // Main Container Variants
    // FIX: Explicitly typed container as Variants.
    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.1 },
        },
    };

    // Minimalist Typography Variants
    // FIX: Explicitly typed letterVariant as Variants and cast the ease property to any to allow custom cubic-bezier arrays.
    const letterVariant: Variants = {
        hidden: { 
            opacity: 0, 
            y: 2,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.215, 0.610, 0.355, 1.000] as any // easeOutCubic
            },
        }
    };

    return (
        <motion.div 
            className={`flex items-center gap-2.5 cursor-pointer group ${className}`}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            {/* Precision Geometric Shield Mark */}
            <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                <motion.div 
                    className="absolute inset-0 bg-polygon-purple/5 rounded-full"
                    variants={{
                        hidden: { scale: 0.8, opacity: 0 },
                        visible: { scale: 1, opacity: 1 },
                        hover: { scale: 1.2, opacity: 0.4, backgroundColor: "rgba(123, 63, 228, 0.1)" }
                    }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                />
                
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 overflow-visible">
                    <motion.path 
                        d="M50 5 L90 25 V75 L50 95 L10 75 V25 L50 5Z" 
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-white/5"
                    />

                    <motion.path 
                        d="M50 22 L75 37 L50 52 L25 37 Z" 
                        fill="#7b3fe4"
                        variants={{
                            hidden: { scale: 0.9, opacity: 0 },
                            visible: { scale: 1, opacity: 1 },
                            hover: { 
                                y: -1,
                                fill: '#9b66ff',
                                transition: { duration: 0.2 }
                            }
                        }}
                    />

                    <motion.path 
                        d="M50 48 L75 63 L50 78 L25 63 Z" 
                        fill="#7b3fe4"
                        variants={{
                            hidden: { scale: 0.9, opacity: 0 },
                            visible: { scale: 1, opacity: 0.7 },
                            hover: { 
                                y: 1,
                                opacity: 1, 
                                fill: '#ffffff',
                                transition: { duration: 0.2 }
                            }
                        }}
                    />
                </svg>
            </div>

            {/* Precision Institutional Typography */}
            {!hideText && (
                <motion.div 
                    className="flex items-center"
                    variants={container}
                >
                    <div className="flex">
                        {polyPart.split("").map((letter, index) => (
                            <motion.span
                                key={`poly-${index}`}
                                variants={letterVariant}
                                className="text-[22px] font-black tracking-[-0.03em] text-white uppercase"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                    <div className="flex">
                        {guardPart.split("").map((letter, index) => (
                            <motion.span
                                key={`guard-${index}`}
                                variants={letterVariant}
                                className="text-[22px] font-black tracking-[-0.03em] text-polygon-purple-light uppercase"
                                whileHover={{ color: "#ffffff" }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CyberpunkLogo;