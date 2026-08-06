
import React from 'react';

const PARTNERS = [
    "AAVE_PROTOCOL", "UNISWAP_LABS", "QUICKSWAP_DEX", "BALANCER_FI", "CURVE_FINANCE", "CHAINLINK_ORACLE", "LEDGER_HQ", "METAMASK_CONSENSYS"
];

const TrustedBy: React.FC = () => {
    return (
        <section className="py-4 border-y border-white/5 bg-[#080808] overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080808] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080808] to-transparent z-10"></div>
            
            <div className="flex items-center gap-16 animate-[scroll_30s_linear_infinite] whitespace-nowrap px-4">
                {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                    <div key={i} className="flex items-center gap-2 group cursor-default">
                        <div className="w-1.5 h-1.5 bg-gray-800 group-hover:bg-blue-500 transition-colors"></div>
                        <span className="text-xs font-mono font-bold text-gray-600 group-hover:text-white transition-colors tracking-widest">
                            {partner}
                        </span>
                    </div>
                ))}
            </div>
            
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
};

export default TrustedBy;