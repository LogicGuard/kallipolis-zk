
import React from 'react';
import Card from '../common/Card';
import { motion } from 'framer-motion';

interface MetricCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.FC<any>;
    color: string;
    glow?: string;
    trend?: string;
    sparklineData?: number[];
    onClick?: () => void;
}

export const DashboardMetricCard: React.FC<MetricCardProps> = ({ 
    label, value, sub, icon: Icon, color, glow, trend = "+2.4%", sparklineData = [30, 45, 35, 60, 50, 75, 90], onClick 
}) => {
    // Generate simple SVG path for sparkline
    const maxVal = Math.max(...sparklineData);
    const minVal = Math.min(...sparklineData);
    const points = sparklineData.map((val, i) => {
        const x = (i / (sparklineData.length - 1)) * 80;
        const y = 20 - ((val - minVal) / (maxVal - minVal || 1)) * 16;
        return `${x},${y}`;
    }).join(' ');

    return (
        <Card 
            onClick={onClick}
            className={`p-3.5 bg-[#080808] border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden cursor-pointer select-none`} 
            style={glow ? { boxShadow: `0 0 20px ${glow}` } : {}}
        >
            <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Icon className="w-14 h-14 text-white" />
            </div>
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-[0.2em] font-black">{label}</span>
                    </div>
                    <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-none">
                        {trend}
                    </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 pt-1">
                    <div className={`text-2xl font-black text-white tracking-tighter font-mono group-hover:text-blue-400 transition-colors`}>{value}</div>
                    
                    {/* Sparkline mini chart */}
                    <div className="w-20 h-6 flex items-center justify-end">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 80 20">
                            <polyline
                                fill="none"
                                stroke={color.includes('green') ? '#22c55e' : color.includes('blue') ? '#3b82f6' : '#a855f7'}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={points}
                            />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`}></div>
                    <span className="text-[7.5px] font-mono text-gray-500 uppercase font-black tracking-widest">{sub}</span>
                </div>
            </div>
        </Card>
    );
};

export const SystemVitalsStrip: React.FC = () => (
    <Card className="h-full bg-[#080808] p-0 border-white/5 overflow-hidden flex flex-col shadow-xl rounded-none relative">
        <div className="p-3 border-b border-white/5 bg-black/60 flex justify-between items-center">
            <span className="text-[8px] font-mono text-gray-400 uppercase font-black tracking-widest">Platform_Vitals</span>
            <span className="text-[8px] font-mono text-emerald-400 font-black uppercase">99.98% Healthy</span>
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center gap-3 bg-[#030303]">
            <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono uppercase">
                    <span className="text-gray-500">Core_Compute_Load</span>
                    <span className="text-blue-400 font-black">42.8%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                    <motion.div className="h-full bg-blue-500" animate={{ width: '42.8%' }} transition={{ duration: 1 }} />
                </div>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono uppercase">
                    <span className="text-gray-500">ZK_Prover_Saturation</span>
                    <span className="text-purple-400 font-black">24.1%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                    <motion.div className="h-full bg-purple-500" animate={{ width: '24.1%' }} transition={{ duration: 1 }} />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono uppercase">
                    <span className="text-gray-500">RPC_P99_Latency</span>
                    <span className="text-green-400 font-black">14ms</span>
                </div>
                <div className="h-1 bg-white/5 rounded-none overflow-hidden">
                    <motion.div className="h-full bg-green-500" animate={{ width: '15%' }} transition={{ duration: 1 }} />
                </div>
            </div>
        </div>
        <div className="p-2 bg-black/80 text-center border-t border-white/5 flex justify-between items-center px-3">
            <span className="text-[7.5px] font-mono text-blue-500 uppercase font-black tracking-[0.2em]">Swarm: 8/8 Online</span>
            <span className="text-[7.5px] font-mono text-gray-600 uppercase">28 Gwei</span>
        </div>
    </Card>
);
