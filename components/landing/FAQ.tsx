
import React, { useState } from 'react';
import { ChevronDownIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
    {
        id: "KB_001",
        question: "Is Kallipolis ZK free to use?",
        answer: "Affirmative. The 'Scout' tier provides essential monitoring and basic heuristic auditing capabilities at no cost. Enhanced throughput and API access require a 'Vanguard' or 'Guardian' clearance level."
    },
    {
        id: "KB_002",
        question: "Does the system require private key access?",
        answer: "Negative. Kallipolis ZK operates as a non-custodial intelligence layer. We analyze public on-chain state and user-provided bytecode. Seed phrases and private keys are never requested or stored."
    },
    {
        id: "KB_003",
        question: "How is the AI auditing model trained?",
        answer: "The kernel leverages Google's Gemini Pro engine, fine-tuned on a proprietary dataset of 15M+ lines of secure and vulnerable Polygon bytecode. It identifies patterns with 94.2% verified precision."
    },
    {
        id: "KB_004",
        question: "Is multi-chain support active?",
        answer: "Currently restricted to Polygon PoS and zkEVM to ensure maximum latency optimization. Cross-chain AggLayer expansion modules are currently in the R&D verification phase."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-32 px-6 bg-[#030303] relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-polygon-purple/5 blur-[150px] rounded-full pointer-events-none"></div>
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/5 pb-10">
                    <div>
                        <div className="text-polygon-purple font-mono text-[10px] font-black uppercase tracking-[0.4em] mb-4">Knowledge_Buffer</div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">Intelligence <span className="text-polygon-purple">Database</span></h2>
                        <p className="text-gray-500 text-sm font-light">
                            Official system specifications and operational queries.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {FAQS.map((faq, i) => (
                        <div 
                            key={i} 
                            className={`border transition-all duration-500 ${openIndex === i ? 'bg-white/[0.03] border-polygon-purple/30' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                        >
                            <button 
                                onClick={() => toggle(i)}
                                className="w-full py-8 px-6 flex items-start justify-between text-left focus:outline-none group"
                            >
                                <div className="flex items-center gap-6">
                                    <span className={`text-[11px] font-mono font-black transition-colors ${openIndex === i ? 'text-polygon-purple' : 'text-gray-600'}`}>{faq.id}</span>
                                    <span className={`text-lg font-bold uppercase tracking-tight transition-colors ${openIndex === i ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        {faq.question}
                                    </span>
                                </div>
                                <div className={`transition-transform duration-500 ${openIndex === i ? 'rotate-180 text-polygon-purple' : 'text-gray-600'}`}>
                                    <ChevronDownIcon className="w-6 h-6" />
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="pl-[82px] pr-8 pb-8 text-base text-gray-400 font-light leading-relaxed">
                                            <span className="text-polygon-purple font-mono font-black mr-3">{">"}</span>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
