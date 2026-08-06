
import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';
import { GrowthIcon, TrendingUpIcon, ActivityIcon, ZapIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const GrowthPredictorView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const prompt = `Act as a Crypto Macro Growth Strategist for Polygon. Analyze current market trends and provide a 12-month growth prediction report in Markdown. 
        Include: 1. Predicted TVL Trajectory. 2. High-Growth Ecosystem Sectors. 3. Technological Catalysts (AggLayer, zkEVM). 4. Potential Risks to Growth. 
        Be analytical, quantitative, and professional.`;

        const { data, error: apiError } = await analyzeWithGemini(prompt);
        if (apiError) setError(apiError);
        else setResult(data);
        setIsLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-sm">
                        <GrowthIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Ecosystem Predictor</h1>
                        <p className="text-xs text-gray-500 font-mono">Macro Trends // Adoption Forensics</p>
                    </div>
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading} className="!px-10 py-3 bg-white text-black hover:bg-gray-200">
                   {isLoading ? 'EXECUTING_MODELS...' : 'RUN_FULL_FORECAST'}
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    <Card className="p-6 bg-[#080808] border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <TrendingUpIcon className="w-32 h-32 text-green-500" />
                        </div>
                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-black mb-6">Market_Sentiment</div>
                        <div className="flex items-end gap-1 h-20 mb-6">
                            {[30, 45, 38, 55, 60, 75, 70, 85, 90].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex-1 bg-green-500/20 border-t border-green-500"
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-gray-500 uppercase">Trend_Status</span>
                            <span className="text-green-400 font-black">ACCELERATING_V2</span>
                        </div>
                    </Card>

                    <Card className="p-6 bg-[#080808] border-white/10">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 font-mono">Historical_Benchmarks</h3>
                        <div className="space-y-3">
                            {[
                                { l: 'User Growth', v: '+24.2%', s: 'up' },
                                { l: 'AggLayer Nodes', v: '18 Active', s: 'up' },
                                { l: 'Avg Tx Cost', v: '0.002 POL', s: 'down' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[10px] font-mono text-gray-400 uppercase">{item.l}</span>
                                    <span className={`text-[10px] font-mono font-black ${item.s === 'up' ? 'text-green-400' : 'text-blue-400'}`}>{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 min-h-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <Card className="h-full flex flex-col items-center justify-center p-12 bg-black border-white/5">
                                <div className="w-12 h-12 border-4 border-t-green-500 border-white/5 rounded-full animate-spin mb-6"></div>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] animate-pulse">Running_Market_Simulations...</p>
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
                            <div className="h-full flex flex-col items-center justify-center border border-white/5 border-dashed bg-white/[0.01] rounded-sm p-12 text-center">
                                <ZapIcon className="w-16 h-16 text-gray-800 mb-6" />
                                <h4 className="text-xs font-mono uppercase tracking-[0.3em] text-gray-600">Forecaster_Idle</h4>
                                <p className="text-[10px] font-mono text-gray-700 mt-2 uppercase">Initialize the prediction engine to view projected network expansion metrics.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default GrowthPredictorView;
