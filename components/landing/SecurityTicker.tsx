
import React from 'react';
import { motion } from 'framer-motion';

const ALERTS = [
  { type: 'SCAN', msg: 'HEURISTIC_ENGINE: AGGLAYER_NODE_07', status: 'ACTIVE', color: 'text-polygon-purple' },
  { type: 'THREAT', msg: 'SUSPICIOUS_TX_DETECTION: 0x8a...3f1', status: 'BLOCKED', color: 'text-red-500' },
  { type: 'PULSE', msg: 'POLYGON_POS_PULSE: 100% UPTIME', status: 'NOMINAL', color: 'text-green-500' },
  { type: 'ZK_PROVE', msg: 'ZK_PROOF_VERIFICATION: 0xf4...e12', status: 'SUCCESS', color: 'text-blue-400' },
  { type: 'FIREWALL', msg: 'MEMPOOL_SHIELD_V4: ENGAGED', status: 'PROTECTING', color: 'text-polygon-purple-light' },
];

const SecurityTicker: React.FC = () => {
  // We duplicate the array to create a seamless infinite loop effect
  const loopItems = [...ALERTS, ...ALERTS, ...ALERTS];

  return (
    <div className="w-full bg-black border-y border-white/5 py-1.5 overflow-hidden relative z-[90] group select-none">
      {/* Subtle overlay for edges to fade text out */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

      <div className="flex items-center whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
        {loopItems.map((alert, i) => (
          <div key={i} className="flex items-center gap-4 px-6 border-r border-white/5">
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${
                alert.type === 'THREAT' ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 
                alert.type === 'PULSE' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 
                'bg-polygon-purple shadow-[0_0_5px_#7b3fe4]'
              }`}></div>
              <span className="font-mono text-[8px] font-black uppercase text-gray-500 tracking-tighter">
                {alert.type}
              </span>
            </div>

            {/* Message Body */}
            <span className="text-gray-300 font-mono text-[9px] font-bold tracking-widest uppercase">
              {alert.msg}
            </span>

            {/* Status Badge */}
            <span className={`text-[8px] font-black tracking-widest px-1.5 bg-white/5 ${alert.color}`}>
              [{alert.status}]
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SecurityTicker;
