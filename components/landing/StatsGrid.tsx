
import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Cumulative Assets Scanned', value: '$1.4B+', sub: 'INSTITUTIONAL_NODES' },
  { label: 'Security Threats Blocked', value: '42,000+', sub: 'REAL_TIME_MITIGATION' },
  { label: 'Audit Latency Avg', value: '0.4s', sub: 'GEMINI_V3_ENGINE' },
  { label: 'Network Uptime (Global)', value: '99.99%', sub: 'SLA_PROTECTED' },
];

const StatsGrid: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[#030303] border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center lg:items-start p-10 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-polygon-purple/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-polygon-purple transition-colors"></div>
              
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-4 group-hover:text-polygon-purple-light transition-colors">
                {stat.label}
              </span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {stat.value}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 w-full">
                <div className="w-1.5 h-1.5 bg-polygon-purple rounded-full animate-pulse shadow-[0_0_8px_#7b3fe4]"></div>
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest font-bold">
                    {stat.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
