
import React, { useState } from 'react';
import { Textarea } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';
import { DAOIcon, ActivityIcon, ShieldCheckIcon, TrendingUpIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const DAOAdvisorView: React.FC = () => {
    const [proposal, setProposal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!proposal.trim()) {
            setError('VALIDATION_ERROR: Proposal input buffer empty.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const prompt = `Act as an expert DAO Governance Analyst for Polygon. Analyze this proposal: 
        "${proposal}"
        Generate a Markdown report with:
        1. Ecosystem Impact Analysis (Positive/Negative).
        2. Financial & Technical Risk Matrix.
        3. Projected Community Sentiment.
        4. Official Voting Recommendation.
        Format it for a professional dashboard.`;
        
        const { data, error: apiError } = await analyzeWithGemini(prompt);
        if (apiError) setError(apiError);
        else setResult(data);
        setIsLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-sm">
                    <DAOIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Governance Advisor</h1>
                    <p className="text-xs text-gray-500 font-mono">Proposal Forensics // Strategic Impact Simulation</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 flex flex-col bg-[#080808] border-white/10 p-0 overflow-hidden">
                        <div className="p-3 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">Proposal_Buffer</span>
                            <span className="text-[8px] text-blue-500 font-mono uppercase">Length: {proposal.length} chars</span>
                        </div>
                        <div className="flex-1 p-6 flex flex-col">
                            <Textarea 
                                placeholder="PASTE_PROPOSAL_DATA_HERE..."
                                value={proposal}
                                onChange={(e) => setProposal(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-xs text-gray-400 resize-none custom-scrollbar"
                            />
                        </div>
                        <div className="p-4 bg-[#050505] border-t border-white/10">
                            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full py-4 justify-center">
                                {isLoading ? 'SIMULATING_OUTCOMES...' : 'EXECUTE_IMPACT_ANALYSIS'}
                            </Button>
                        </div>
                    </Card>
                    
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase">
                            {error}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7 flex flex-col min-h-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <Card className="flex-1 flex flex-col items-center justify-center bg-[#050505] border-white/10 p-12 text-center">
                                <div className="w-16 h-16 relative mb-8">
                                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-sm font-mono text-white uppercase tracking-[0.5em] mb-2">Analyzing_Governance_Graph</h3>
                                <p className="text-[9px] font-mono text-gray-600 uppercase">Calculating vector offsets and economic equilibrium points...</p>
                            </Card>
                        ) : result ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 overflow-y-auto custom-scrollbar pr-2"
                            >
                                <ResultDisplay content={result} />
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border border-white/5 border-dashed bg-white/[0.01] rounded-sm p-12 text-center">
                                <DAOIcon className="w-16 h-16 text-gray-800 mb-6" />
                                <h4 className="text-xs font-mono uppercase tracking-[0.3em] text-gray-600">Advisor_Offline</h4>
                                <p className="text-[10px] font-mono text-gray-700 mt-2 uppercase">Provide proposal text to activate the governance simulation kernel.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DAOAdvisorView;
