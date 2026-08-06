
import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
// FIX: SkeletonLoader is a default export from '../common/Loader', so it must be imported outside the braces.
import SkeletonLoader, { CardSkeleton, ListSkeleton } from '../common/Loader';
import { useWallet } from '../../context/WalletContext';
import { analyzeWalletReport } from '../../services/geminiService';
import { WalletReportResult } from '../../types';
import { ShieldCheckIcon, ThreatIcon, WalletIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const WalletReportView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<WalletReportResult | null>(null);
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
        
        const { data, error: apiError } = await analyzeWalletReport(addressToAnalyze);

        if (data) {
            setResult(data);
        }
        if (apiError) {
            setError(apiError);
        }
        
        setIsLoading(false);
    };

    const getRiskColor = (riskLevel: 'Safe' | 'Caution' | 'High Risk') => {
        switch (riskLevel) {
            case 'Safe': return 'text-green-400';
            case 'Caution': return 'text-yellow-400';
            case 'High Risk': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const renderLoadingState = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            <Card className="lg:col-span-1 p-0 bg-[#080808] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 bg-[#0A0A0A]">
                    <SkeletonLoader className="h-3 w-24" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="relative w-40 h-40 rounded-full border border-white/5 flex items-center justify-center">
                        <SkeletonLoader className="h-32 w-32 rounded-full" />
                        <motion.div 
                            className="absolute inset-0 border-2 border-blue-500/20 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <SkeletonLoader className="h-4 w-32 mt-6" />
                </div>
                <div className="p-6 border-t border-white/10 bg-[#050505] space-y-2">
                    <SkeletonLoader className="h-2 w-full" />
                    <SkeletonLoader className="h-2 w-4/5" />
                </div>
            </Card>
            <div className="lg:col-span-2 space-y-6">
                <CardSkeleton className="h-64" />
                <CardSkeleton className="h-96" />
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                    <WalletIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Wallet Dossier</h1>
                    <p className="text-xs text-gray-500 font-mono">Deep Identity Scanning // Risk Profiling</p>
                </div>
            </div>
            
            <div className="flex gap-4 mb-8">
                <Input 
                    placeholder="ENTER_TARGET_ADDRESS (0x...)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="font-mono flex-1 bg-[#080808]"
                />
                <Button onClick={handleAnalyze} disabled={isLoading} className="px-8">
                    {isLoading ? 'SCANNING...' : 'INITIATE SCAN'}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="mb-6 p-4 bg-red-500/10 border-red-500/30">
                            <p className="text-red-400 font-mono text-xs">{error}</p>
                        </Card>
                    </motion.div>
                )}

                {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {renderLoadingState()}
                    </motion.div>
                ) : result ? (
                    <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Score Card */}
                        <Card className="lg:col-span-1 p-0 bg-[#080808] overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-white/10 bg-[#0A0A0A]">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Security Score</h3>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                                <div className="relative w-48 h-48 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-800" />
                                        <motion.circle 
                                            cx="96" cy="96" r="88" 
                                            stroke="currentColor" 
                                            strokeWidth="4" 
                                            fill="transparent" 
                                            className={getRiskColor(result.riskLevel)}
                                            strokeDasharray={553}
                                            strokeDashoffset={553}
                                            animate={{ strokeDashoffset: 553 - (553 * result.securityScore) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="text-center z-10">
                                        <motion.span 
                                            className="text-5xl font-bold font-mono text-white block"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            {result.securityScore}
                                        </motion.span>
                                        <span className={`text-xs uppercase tracking-widest font-bold mt-1 block ${getRiskColor(result.riskLevel)}`}>
                                            {result.riskLevel}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                    <div className="absolute inset-4 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10 bg-[#050505]">
                                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                                    <span className="text-blue-500 mr-2">{">"}</span>
                                    {result.summary}
                                </p>
                            </div>
                        </Card>

                        {/* Analysis Grid */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-0 bg-[#080808]">
                                <div className="p-4 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
                                        <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                                        Security Strengths
                                    </h3>
                                    <span className="text-[10px] font-mono text-gray-600">COUNT: {result.positivePoints.length}</span>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {result.positivePoints.map((point, i) => (
                                        <div key={i} className="p-3 bg-green-500/5 border border-green-500/10 rounded-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-sm"></div>
                                                <strong className="text-xs font-bold text-green-100 uppercase">{point.title}</strong>
                                            </div>
                                            <p className="text-[11px] text-green-400/70 font-mono pl-3.5">{point.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-0 bg-[#080808]">
                                <div className="p-4 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
                                        <ThreatIcon className="w-4 h-4 text-red-500" />
                                        Detected Vulnerabilities
                                    </h3>
                                    <span className="text-[10px] font-mono text-gray-600">COUNT: {result.risks.length}</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    {result.risks.map((risk, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 hover:border-red-500/30 transition-colors group">
                                            <div className={`mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${risk.severity === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' : risk.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                                                {risk.severity}
                                            </div>
                                            <div>
                                                <strong className="text-sm text-gray-200 block mb-1 group-hover:text-white transition-colors">{risk.title}</strong>
                                                <p className="text-xs text-gray-500 font-mono">{risk.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="h-full flex flex-col items-center justify-center border border-white/10 border-dashed bg-white/[0.02] p-12 text-center rounded-sm min-h-[400px]">
                            <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheckIcon className="w-8 h-8 text-gray-700" />
                            </div>
                            <h3 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">No Active Report</h3>
                            <p className="text-[10px] font-mono text-gray-600 max-w-xs uppercase leading-relaxed">
                                Input a verified wallet address to generate a cryptographic security assessment.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletReportView;
