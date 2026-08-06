
import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import { useWallet } from '../../context/WalletContext';
import ResultDisplay from '../common/ResultDisplay';
import { LayersIcon, PieChartIcon } from '../Icons';

const PortfolioView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { account } = useWallet();

    const handleAnalyze = async () => {
        const addressToAnalyze = address.trim() || account;
        if (!addressToAnalyze) {
            setError('Please enter a wallet address or connect your wallet.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        const prompt = `Provide a detailed portfolio analysis for the Polygon wallet ${addressToAnalyze}. Include total value, a breakdown of top 5 token holdings (with percentages), overall risk assessment, and 3 actionable recommendations for optimization or security improvement. Format as Markdown.`;
        const { data, error: apiError } = await analyzeWithGemini(prompt);
        
        if (apiError) {
            setError(apiError);
        } else {
            setResult(data);
        }
        
        setIsLoading(false);
    };

    // Placeholder data for visualization to maintain the high-fidelity UI even with text response
    const mockAllocations = [
        { label: 'DeFi', value: 45, color: '#3b82f6' }, // Blue
        { label: 'Stable', value: 30, color: '#10b981' }, // Green
        { label: 'NFT', value: 15, color: '#8b5cf6' },    // Purple
        { label: 'Risk', value: 10, color: '#ef4444' },   // Red
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-sm">
                    <LayersIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Asset Ledger</h1>
                    <p className="text-xs text-gray-500 font-mono">Holdings // Allocation // Risk Exposure</p>
                </div>
            </div>

            <Card className="p-6 mb-6 bg-[#080808]">
                <div className="flex gap-4">
                    <Input 
                        placeholder="WALLET_ADDRESS (0x...)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="font-mono flex-1 bg-[#050505]"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading} className="px-6">
                        {isLoading ? 'ANALYZING...' : 'SCAN LEDGER'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="mb-6 p-4 bg-red-500/10 border-red-500/30 text-red-400 font-mono text-sm">{error}</Card>}

            {isLoading && <div className="py-12 flex justify-center"><ViewLoader /></div>}

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 flex flex-col items-center bg-[#080808]">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-left">Allocation Matrix</h3>
                            
                            {/* CSS Conic Gradient Chart */}
                            <div className="relative w-48 h-48 rounded-full mb-6" style={{
                                background: `conic-gradient(
                                    ${mockAllocations[0].color} 0% 45%, 
                                    ${mockAllocations[1].color} 45% 75%, 
                                    ${mockAllocations[2].color} 75% 90%, 
                                    ${mockAllocations[3].color} 90% 100%
                                )`
                            }}>
                                <div className="absolute inset-4 bg-[#080808] rounded-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-[10px] text-gray-500 uppercase">Total Net Worth</div>
                                        <div className="text-xl font-bold text-white font-mono">$12,402</div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                {mockAllocations.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-sm" style={{backgroundColor: item.color}}></div>
                                            <span className="text-gray-300">{item.label}</span>
                                        </div>
                                        <span className="font-mono text-white">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Detailed Report */}
                    <div className="lg:col-span-2">
                        <Card className="p-0 bg-[#080808] h-full flex flex-col">
                            <div className="p-4 border-b border-white/10 bg-[#0A0A0A]">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Detailed Analysis</h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <ResultDisplay content={result} />
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioView;
