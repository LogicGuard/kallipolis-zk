
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, ActivityIcon, ZapIcon } from '../Icons';

const REVIEWS = [
    {
        id: "THREAT_REP_892",
        name: "Dev_Lead_X",
        role: "Institutional DeFi",
        text: "Automated audit identified a critical state-transition vulnerability in our zk-bridge. Neutralized the vector before state-finality. Loss prevention: ~$4.2M.",
        status: "RESOLVED",
        timestamp: "2025.04.12 14:02",
        impact: "CRITICAL"
    },
    {
        id: "OPS_SIGNAL_442",
        name: "Security_Op_07",
        role: "Validator Cluster",
        text: "The pre-execution firewall now handles 100% of our incoming RPC traffic. Drastic reduction in malicious MEV attempts and successful phishing signatures.",
        status: "ACTIVE",
        timestamp: "2025.05.01 09:15",
        impact: "HIGH"
    },
    {
        id: "INTELL_LOG_772",
        name: "Chief_Architect",
        role: "AggLayer Protocol",
        text: "Kallipolis ZK's heuristic mapping provides the most granular view of Polygon network health we've deployed to date. A mandatory layer for our stack.",
        status: "NOMINAL",
        timestamp: "2025.05.14 11:42",
        impact: "OPTIMAL"
    }
];

const Testimonials: React.FC = () => {
    return (
        <section className="py-32 px-6 bg-[#020202] relative overflow-hidden border-b border-white/5">
            {/* Background Grid & Ambient Glow */}
            <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-polygon-purple/20 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-polygon-purple/10 border border-polygon-purple/20 rounded-sm">
                            <ActivityIcon className="w-3 h-3 text-polygon-purple-light" />
                            <span className="text-[10px] font-mono text-polygon-purple-light uppercase tracking-[0.3em] font-black">Field_Intelligence</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
                            Operational <br/> <span className="text-polygon-purple">Debriefs</span>
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md font-light leading-relaxed border-l border-white/10 pl-6 italic">
                            Real-time telemetry and feedback from active security units deployed across the AggLayer.
                        </p>
                    </div>
                    <div className="hidden md:block text-right font-mono">
                        <div className="text-[10px] text-gray-700 uppercase tracking-widest font-black mb-1">Source: Verified_Logs</div>
                        <div className="text-[12px] text-polygon-purple-light font-bold">100% CRYPTOGRAPHIC_INTEGRITY</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REVIEWS.map((review, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group relative bg-[#080808] border border-white/5 p-8 hover:border-polygon-purple/30 transition-all duration-500 overflow-hidden"
                        >
                            {/* Scanning Line Animation on Hover */}
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-polygon-purple/20 blur-[1px] animate-scan"></div>
                            </div>

                            {/* Card Header: Forensic ID */}
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-polygon-purple font-black tracking-widest leading-none mb-1">{review.id}</span>
                                    <span className="text-[8px] font-mono text-gray-700 uppercase">{review.timestamp}</span>
                                </div>
                                <div className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-sm border ${
                                    review.impact === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                    review.impact === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                    'bg-green-500/10 text-green-500 border-green-500/20'
                                }`}>
                                    {review.impact}
                                </div>
                            </div>

                            {/* Body: The "Log" Content */}
                            <div className="mb-10 min-h-[120px] relative">
                                <span className="absolute -left-4 top-0 text-polygon-purple/30 font-mono text-lg font-black">{">"}</span>
                                <p className="text-[13px] font-mono text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                                    {review.text}
                                </p>
                            </div>

                            {/* Footer: User Identity & Verification */}
                            <div className="flex items-center justify-between pt-6 border-t border-white/5 bg-gradient-to-t from-white/[0.01] to-transparent -mx-8 px-8 -mb-8 pb-8">
                                <div>
                                    <div className="text-[13px] font-black text-white uppercase tracking-wider group-hover:text-polygon-purple-light transition-colors">{review.name}</div>
                                    <div className="text-[9px] text-gray-600 font-mono uppercase tracking-tight font-bold">{review.role}</div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-[9px] font-black font-mono border transition-all duration-500 ${
                                    review.status === 'RESOLVED' ? 'bg-green-500 text-black border-green-500' : 
                                    review.status === 'ACTIVE' ? 'bg-blue-500 text-white border-blue-500' : 
                                    'bg-gray-800 text-gray-400 border-white/10'
                                } shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110`}>
                                    <ShieldCheckIcon className="w-3 h-3" />
                                    {review.status}
                                </div>
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute bottom-0 right-0 w-8 h-8 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none">
                                <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                                    <path d="M100 0 L100 100 L0 100 Z" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sub-Testimonial Live Feed Decoration */}
                <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                    {['TX_VERIFIED', 'AUDIT_COMPLETE', 'THREAT_NEUTRALIZED', 'UPLINK_STABLE'].map((status, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-1 h-1 bg-polygon-purple rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-mono text-gray-500 font-black tracking-[0.4em] uppercase">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: -10%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default Testimonials;
