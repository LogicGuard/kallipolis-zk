
import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { analyzeRegulatoryCompliance } from '../../services/geminiService';
import { RegulatoryComplianceResult } from '../../types';
import { ComplianceIcon, ShieldCheckIcon, ThreatIcon, ActivityIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const RegulatoryComplianceView: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RegulatoryComplianceResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!identifier.trim()) {
            setError('Please enter a protocol address or project name.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const { data, error: apiError } = await analyzeRegulatoryCompliance(identifier);
        if (data) setResult(data);
        if (apiError) setError(apiError);

        setIsLoading(false);
    };

    const getRiskColor = (level: string) => {
        const l = level.toLowerCase();
        if (l.includes('low')) return 'text-green-400';
        if (l.includes('medium')) return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                    <ComplianceIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Compliance Protocol</h1>
                    <p className="text-xs text-gray-500 font-mono">AML/KYC Forensics // Regulatory Alignment Check</p>
                </div>
            </div>

            <Card className="p-6 mb-8 bg-[#080808] border-white/10">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input 
                        placeholder="ENTER_PROTOCOL_ADDRESS_OR_ID (0x...)"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="font-mono flex-1 bg-[#050505]"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading} className="sm:px-10">
                        {isLoading ? 'AUDITING...' : 'RUN_COMPLIANCE_SCAN'}
                    </Button>
                </div>
                <p className="text-[9px] font-mono text-gray-600 uppercase mt-4 tracking-widest">
                    Targets: FATF Travel Rule, AMLD6 Verification, Sanction List Scanning.
                </p>
            </Card>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <Card className="h-96 flex flex-col items-center justify-center bg-[#050505] border-white/5">
                        <div className="w-12 h-12 border-4 border-t-blue-500 border-white/5 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em]">Querying_International_Regulatory_Nodes...</p>
                    </Card>
                ) : result ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <Card className="p-6 bg-[#080808] border-white/10">
                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase">
                                <ActivityIcon className="w-4 h-4" /> AML Monitoring
                            </div>
                            <div className={`text-2xl font-black font-mono mb-2 uppercase ${getRiskColor(result.amlRisk.level)}`}>
                                {result.amlRisk.level}_RISK
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono leading-relaxed mb-4">{result.amlRisk.summary}</p>
                            <div className="space-y-1.5">
                                {result.amlRisk.flags.map((flag, i) => (
                                    <div key={i} className="flex gap-2 items-center text-[9px] font-mono text-red-400 bg-red-500/5 p-1 px-2 border border-red-500/10">
                                        <ThreatIcon className="w-2.5 h-2.5" /> {flag}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 bg-[#080808] border-white/10">
                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase">
                                <ShieldCheckIcon className="w-4 h-4" /> Status
                            </div>
                            <div className={`text-2xl font-black font-mono mb-2 uppercase ${result.complianceStatus.status === 'Compliant' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {result.complianceStatus.status}
                            </div>
                            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">{result.complianceStatus.summary}</p>
                        </Card>

                        <Card className="p-6 bg-[#0C0C0C] border-blue-500/20">
                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase">
                                <ComplianceIcon className="w-4 h-4" /> Legal Score
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-black font-mono text-white">{result.legalRisk.score}</span>
                                <span className="text-xs font-mono text-gray-600">/100</span>
                            </div>
                            <p className="text-[11px] text-gray-300 font-mono leading-relaxed">{result.legalRisk.summary}</p>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-sm opacity-20">
                        <ComplianceIcon className="w-16 h-16 text-white mb-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.4em]">Awaiting_Signal</span>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RegulatoryComplianceView;
