
import React from 'react';
import Button from '../common/Button';
import { CheckCircleIcon, ZapIcon } from '../Icons';
import { motion } from 'framer-motion';

const TIERS = [
    {
        id: 'scout',
        name: "L1: Reconnaissance",
        price: "0",
        period: "POL / MO",
        description: "Entry-level monitoring for individual security oversight.",
        features: [
            "Wallet Activity Monitoring",
            "5 Algorithmic Audits / Mo",
            "Standard Signal Latency",
            "Email Digest Reports"
        ],
        cta: "INITIALIZE_L1",
        variant: "secondary" as const
    },
    {
        id: 'vanguard',
        name: "L2: Vanguard",
        price: "24",
        period: "POL / MO",
        description: "Professional-grade defense for active developers.",
        features: [
            "Unlimited Heuristic Auditing",
            "Real-time Tactical Threat Map",
            "Tx Firewall Simulation",
            "Priority Kernel Execution",
            "Advanced Gas Forensics"
        ],
        cta: "INITIALIZE_VANGUARD",
        popular: true,
        variant: "primary" as const
    },
    {
        id: 'guardian',
        name: "L3: Protocol",
        price: "Custom",
        period: "SECURE_CHANNEL",
        description: "Enterprise infrastructure for institutional nodes.",
        features: [
            "Dedicated Compute Cluster",
            "24/7 Threat Ops Monitoring",
            "White-Label Security Reports",
            "Custom Firewall Rulebooks",
            "Audit Certificate API"
        ],
        cta: "CONTACT_OPS",
        variant: "secondary" as const
    }
];

interface PricingSectionProps {
    onSelect: () => void;
    onContact: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onSelect, onContact }) => {
    return (
        <section className="py-24 px-6 bg-[#030303] relative overflow-hidden" id="pricing">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(123,63,228,0.08),transparent)] pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <div className="inline-block px-3 py-1 bg-polygon-purple/10 border border-polygon-purple/20 rounded-full mb-2">
                        <span className="text-[9px] font-mono text-polygon-purple-light uppercase tracking-[0.3em] font-bold">Allocation</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Security <span className="text-polygon-purple">Authorization</span></h2>
                    <p className="text-gray-500 text-sm max-w-lg mx-auto font-light leading-relaxed">
                        Select an authorization level based on your operational throughput requirements.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TIERS.map((tier, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col relative bg-[#080808] border transition-all duration-500 group ${
                                tier.popular 
                                    ? 'border-polygon-purple/50 shadow-[0_15px_40px_-15px_rgba(123,63,228,0.2)]' 
                                    : 'border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="p-8 flex-1 relative z-10">
                                <div className="mb-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em] font-black">{tier.name}</h3>
                                        {tier.popular && (
                                            <div className="bg-polygon-purple text-white text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tighter flex items-center gap-1">
                                                <ZapIcon className="w-2.5 h-2.5" /> Best
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-1.5 mb-4">
                                        <span className="text-5xl font-black text-white tracking-tighter font-mono">{tier.price}</span>
                                        <span className="text-[9px] font-mono text-gray-600 uppercase">{tier.period}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-light leading-relaxed">{tier.description}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-[8px] font-mono text-gray-600 uppercase tracking-[0.3em] font-bold border-b border-white/5 pb-2">
                                        Capability_Buffer
                                    </div>
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 group/item">
                                                <div className="mt-1 w-1 h-1 bg-polygon-purple rounded-sm flex-shrink-0"></div>
                                                <span className="font-mono text-[10px] text-gray-400 group-hover/item:text-gray-200 transition-colors uppercase tracking-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5 bg-black/40 relative z-10">
                                <Button 
                                    onClick={tier.id === 'guardian' ? onContact : onSelect}
                                    className={`w-full justify-center rounded-none py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                        tier.popular 
                                            ? 'bg-white text-black hover:!bg-polygon-purple hover:!text-white border-none' 
                                            : 'bg-transparent border border-white/20 hover:border-polygon-purple hover:text-white text-white font-mono'
                                    }`}
                                >
                                    {tier.cta}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
