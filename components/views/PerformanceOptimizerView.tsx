
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';
import { ZapIcon, ActivityIcon, CpuIcon, RefreshIcon } from '../Icons';

const PerformanceOptimizerView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [liveTps, setLiveTps] = useState<number[]>(Array.from({ length: 20 }, () => 20 + Math.random() * 10));

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveTps(prev => [...prev.slice(1), 20 + Math.random() * 25]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setResult(null);
        setError(null);

        const prompt = `Generate a Polygon network performance optimization report. Current observed TPS variance is [${liveTps.join(',')}]. 
        Include: 1. Traffic Analysis & Prediction. 2. Bottleneck Detection. 3. Suggested Scalability Solutions. 4. Validator Efficiency. Format as Markdown.`;
        
        const { data, error: apiError } = await analyzeWithGemini(prompt);
        if (apiError) setError(apiError);
        else setResult(data);
        setIsLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
                        <ZapIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Kernel Optimizer</h1>
                        <p className="text-xs text-gray-500 font-mono">TPS Forensics // Throughput Normalization</p>
                    </div>
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading} className="!px-8 py-3">
                   {isLoading ? 'SCANNING_TRAFFIC...' : 'RUN_FULL_OPTIMIZATION'}
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    {/* Live TPS Monitor */}
                    <Card className="p-6 bg-[#080808] border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">Live_TPS_Signal</span>
                            <span className="text-xs font-mono text-yellow-500 font-black">{liveTps[liveTps.length-1].toFixed(1)} <span className="text-[8px] text-gray-600">REQ/S</span></span>
                        </div>
                        <div className="h-24 flex items-end gap-1">
                            {liveTps.map((val, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(val / 60) * 100}%` }}
                                    className={`flex-1 rounded-t-sm ${val > 40 ? 'bg-red-500/40' : val > 30 ? 'bg-yellow-500/40' : 'bg-blue-500/40'}`}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-[#080808]">
                         <div className="flex items-center gap-3 mb-4">
                            <CpuIcon className="w-5 h-5 text-gray-600" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Compute Core</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Node Uptime', val: '99.99%', status: 'nominal' },
                                { label: 'Sync Latency', val: '12ms', status: 'optimal' },
                                { label: 'Mem Utilization', val: '42%', status: 'low' },
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[10px] font-mono text-gray-500">{stat.label}</span>
                                    <span className="text-[10px] font-mono text-white font-bold uppercase">{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 h-full min-h-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <Card className="h-full flex flex-col items-center justify-center p-12 bg-black/40 border-white/5">
                                <div className="w-16 h-16 relative mb-8">
                                    <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-yellow-500 rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-sm font-mono text-white uppercase tracking-[0.5em] mb-2">Analyzing_Uplink</h3>
                                <p className="text-[9px] font-mono text-gray-600 uppercase">Heuristic engine calculating network equilibrium...</p>
                            </Card>
                        ) : result ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full overflow-y-auto custom-scrollbar pr-2"
                            >
                                <ResultDisplay content={result} />
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border border-white/10 border-dashed bg-white/[0.01] rounded-sm py-20 text-center px-12">
                                <ActivityIcon className="w-16 h-16 text-gray-800 mb-6" />
                                <h3 className="text-sm font-mono text-gray-600 uppercase tracking-widest mb-2">Optimizer Offline</h3>
                                <p className="text-[10px] font-mono text-gray-700 uppercase leading-relaxed">
                                    Execute full optimization to calibrate network parameters and resolve throughput bottlenecks.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PerformanceOptimizerView;
