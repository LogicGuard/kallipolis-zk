
import React from 'react';
import { motion } from 'framer-motion';
import { WalletIcon, SearchIcon, ShieldCheckIcon } from '../Icons';

const STEPS = [
    {
        id: '01',
        title: "Signal Acquisition",
        subtitle: "Connect & Ingest",
        description: "Securely link wallet signatures. The system immediately aggregates on-chain history, token approvals, and AggLayer logs into a local context buffer.",
        icon: WalletIcon,
        status: "WAITING_INPUT"
    },
    {
        id: '02',
        title: "Heuristic Analysis",
        subtitle: "Gemini Pro Processing",
        description: "Data is piped through our fine-tuned LLM kernel. Millions of exploit vectors are cross-referenced against your specific Polygon node interactions.",
        icon: SearchIcon,
        status: "PROCESSING"
    },
    {
        id: '03',
        title: "Defense Activation",
        subtitle: "Mitigation & Report",
        description: "Receive a prioritized threat matrix. Auto-generate revocation transactions and deploy firewall rules to neutralize identified vulnerabilities.",
        icon: ShieldCheckIcon,
        status: "READY"
    }
];

const HowItWorks: React.FC = () => {
    return (
        <section className="py-32 px-6 relative border-b border-white/5 bg-[#030303]">
             <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>

             <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/5 pb-10">
                    <div>
                        <div className="text-polygon-purple font-mono text-[10px] font-black uppercase tracking-[0.4em] mb-4">Operational_Logic</div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase">Standard <span className="text-polygon-purple">SOP</span></h2>
                        <p className="text-gray-500 text-sm max-w-lg font-light">
                            Military-grade operating procedures for institutional asset protection.
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-black">POLYGON_S1_NODE_LOGIC</div>
                        <div className="text-[10px] font-mono text-polygon-purple-light uppercase tracking-widest font-black">Sequence: 100% Linear</div>
                    </div>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="hidden md:block absolute top-14 left-0 right-0 h-px bg-gradient-to-r from-transparent via-polygon-purple/30 to-transparent"></div>

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.6 }}
                            className="relative"
                        >
                            <div className="hidden md:flex absolute top-14 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#030303] border border-polygon-purple/60 rotate-45 z-10 shadow-[0_0_10px_rgba(123,63,228,0.4)]"></div>

                            <div className="h-full bg-white/[0.01] border border-white/5 hover:border-polygon-purple/40 hover:bg-white/[0.03] transition-all duration-500 p-10 flex flex-col group relative overflow-hidden rounded-none">
                                <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-white/10 group-hover:border-polygon-purple transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-10">
                                    <span className="text-5xl font-mono font-black text-white/[0.03] group-hover:text-polygon-purple/10 transition-colors leading-none tracking-tighter">{step.id}</span>
                                    <step.icon className="w-8 h-8 text-polygon-purple-light drop-shadow-[0_0_10px_rgba(123,63,228,0.3)]" />
                                </div>
                                
                                <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{step.title}</h3>
                                <p className="text-[10px] font-mono text-polygon-purple-light mb-6 uppercase tracking-widest font-black">{step.subtitle}</p>
                                
                                <p className="text-sm text-gray-500 leading-relaxed mb-10 flex-grow font-light">
                                    {step.description}
                                </p>

                                <div className="border-t border-white/5 pt-6 flex justify-between items-center text-[10px] font-mono text-gray-600 font-bold tracking-widest">
                                    <span>SYSTEM_STATUS</span>
                                    <span className={i === 1 ? "text-polygon-purple animate-pulse" : "text-gray-500"}>
                                        [{step.status}]
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
