
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

const GRID_SIZE = 8; // 8x8 Grid for activity sectors
const SECTORS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    id: i,
    label: `S_${i.toString(16).toUpperCase().padStart(2, '0')}`
}));

const ActivityHeatmap: React.FC = () => {
    const [intensity, setIntensity] = useState<number[]>(SECTORS.map(() => Math.random()));

    useEffect(() => {
        const interval = setInterval(() => {
            setIntensity(prev => prev.map(val => {
                const change = (Math.random() - 0.5) * 0.2;
                return Math.max(0.1, Math.min(1, val + change));
            }));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        // FIX: Removed unsupported 'title' prop from Card component.
        <Card className="h-full bg-[#050505] p-4 flex flex-col border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 tech-bg opacity-[0.02] pointer-events-none"></div>
            
            <div className="grid grid-cols-8 gap-1.5 flex-1 mb-4">
                {SECTORS.map((sector, i) => (
                    <div key={sector.id} className="relative aspect-square group/tile cursor-crosshair">
                        <motion.div 
                            animate={{ 
                                backgroundColor: intensity[i] > 0.8 ? '#7b3fe4' : 
                                               intensity[i] > 0.5 ? '#3b82f6' : 
                                               'rgba(255,255,255,0.05)',
                                opacity: intensity[i]
                            }}
                            className="w-full h-full rounded-none"
                            style={{ 
                                boxShadow: intensity[i] > 0.8 ? '0 0 10px rgba(123, 99, 228, 0.4)' : 'none' 
                            }}
                        />
                        {/* Hover Tooltip */}
                        <div className="absolute inset-0 z-10 opacity-0 group-hover/tile:opacity-100 transition-opacity bg-black/80 flex flex-col items-center justify-center pointer-events-none border border-white/20">
                            <span className="text-[6px] font-mono text-white font-black">{sector.label}</span>
                            <span className="text-[6px] font-mono text-blue-400">{(intensity[i] * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-end">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-gray-600 font-mono uppercase font-black">Active_Sectors</span>
                        <span className="text-[10px] text-white font-mono font-black">42/64</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[7px] text-gray-600 font-mono uppercase font-black">Mean_Load</span>
                        <span className="text-[10px] text-blue-400 font-mono font-black">
                            {(intensity.reduce((a, b) => a + b, 0) / intensity.length * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-0.5 h-3 bg-blue-500/20" />)}
                </div>
            </div>
        </Card>
    );
};

export default ActivityHeatmap;