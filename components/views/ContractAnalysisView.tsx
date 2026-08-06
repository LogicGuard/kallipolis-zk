
import React, { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { analyzeWithGemini } from '../../services/geminiService';
import { ShieldCheckIcon, ThreatIcon, SearchIcon, ActivityIcon, RefreshIcon, GlobeIcon } from '../Icons';
import ResultDisplay from '../common/ResultDisplay';
import { motion, AnimatePresence } from 'framer-motion';

const ContractAnalysisView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [deploymentInfo, setDeploymentInfo] = useState<{ block: string; timestamp: string } | null>(null);

    // Validation state
    const [validation, setValidation] = useState({
        length: false,
        hexPrefix: false,
        validChars: false
    });

    useEffect(() => {
        const addr = address.trim();
        setValidation({
            length: addr.length === 42,
            hexPrefix: addr.startsWith('0x'),
            validChars: /^0x[a-fA-F0-9]*$/.test(addr)
        });
    }, [address]);

    const handleAnalyze = async () => {
        if (!address.trim() || !address.startsWith('0x')) {
            setError('VALIDATION_ERROR: Invalid Polygon contract address format.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        setDeploymentInfo(null);
        
        const prompt = `Perform a deep security analysis of the Polygon smart contract at address: ${address}. 
        First, identify the block number and UTC timestamp of its deployment on Polygon. 
        Format this deployment info clearly at the very beginning of your response as: "DEPLOYMENT_INFO: Block #X | YYYY-MM-DD HH:mm:ss UTC".
        Then provide a comprehensive security report in Markdown format. 
        Focus on:
        1. Security Rating (0-100)
        2. Known Vulnerabilities (Reentrancy, Logic errors, etc.)
        3. Ownership & Centralization Risks
        4. Gas Efficiency
        5. Bytecode Heuristics.`;

        const { data, error: apiError } = await analyzeWithGemini(prompt);

        if(apiError){
            setError(apiError);
        } else if (data) {
            // Attempt to extract deployment metadata from the text response
            const metadataMatch = data.match(/DEPLOYMENT_INFO:\s*Block\s*#?([\d,]+)\s*\|\s*([^(\n\r]+)/i);
            let cleanData = data;

            if (metadataMatch) {
                setDeploymentInfo({
                    block: metadataMatch[1],
                    timestamp: metadataMatch[2].trim()
                });
                // Strip the extraction tag from the displayed content
                cleanData = data.replace(/DEPLOYMENT_INFO:.*(\r?\n|$)/i, '').trim();
            }
            setResult({ raw: cleanData });
        }
        
        setIsLoading(false);
    };

    const isFullyValid = validation.length && validation.hexPrefix && validation.validChars;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                    <SearchIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Deep Scanner</h1>
                    <p className="text-xs text-gray-500 font-mono">Bytecode Heuristics // Vulnerability Mapping</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Control Panel */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="p-0 bg-[#080808] border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Initialization_Panel</span>
                            <ActivityIcon className={`w-3 h-3 ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-700'}`} />
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="relative">
                                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase font-mono">Contract Identity (Hex)</label>
                                <div className="relative group">
                                    <Input 
                                        placeholder="0x..."
                                        value={address}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={`font-mono text-sm pr-12 transition-all ${isInputFocused ? 'border-blue-500/50 bg-[#0A0A0A]' : ''}`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${validation.hexPrefix ? 'bg-blue-500' : 'bg-white/5'}`}></div>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validation.length ? 'bg-blue-500' : 'bg-white/5'}`}></div>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {deploymentInfo && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-sm space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <GlobeIcon className="w-3 h-3 text-blue-400" />
                                                <h4 className="text-[9px] font-mono text-blue-400 uppercase tracking-widest font-black">Deployment_Origin</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[8px] font-mono text-gray-600 uppercase block mb-1">Block_Height</span>
                                                    <a 
                                                        href={`https://polygonscan.com/block/${deploymentInfo.block.replace(/,/g, '')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-mono text-white font-bold hover:text-blue-400 transition-colors flex items-center gap-1 group/link"
                                                    >
                                                        #{deploymentInfo.block}
                                                        <span className="text-[8px] opacity-0 group-hover/link:opacity-100 transition-opacity">↗</span>
                                                    </a>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-mono text-gray-600 uppercase block mb-1">UTC_Timestamp</span>
                                                    <span className="text-[10px] font-mono text-white font-bold leading-none">{deploymentInfo.timestamp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Validation Checklist */}
                            <div className="space-y-2 bg-black/40 p-3 border border-white/5 rounded-sm">
                                <h4 className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Pre-Analysis Checklist</h4>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {[
                                        { label: 'HEX_PREFIX_CHECK', valid: validation.hexPrefix },
                                        { label: 'LENGTH_VERIFICATION (42)', valid: validation.length },
                                        { label: 'ALPHANUMERIC_INTEGRITY', valid: validation.validChars }
                                    ].map((check, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className={`text-[10px] font-mono ${check.valid ? 'text-gray-400' : 'text-gray-600'}`}>{check.label}</span>
                                            {check.valid ? (
                                                <ShieldCheckIcon className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full border border-white/10"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button 
                                onClick={handleAnalyze} 
                                disabled={isLoading || (!isFullyValid && address.length > 0)}
                                className={`w-full justify-center py-4 transition-all ${isFullyValid ? 'shadow-[0_0_20px_rgba(59,130,246,0.2)]' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                                        INJECTING_PROBE...
                                    </span>
                                ) : 'START_SCAN'}
                            </Button>
                        </div>
                        
                        <div className="p-3 border-t border-white/10 bg-[#050505] flex justify-between items-center text-[9px] font-mono text-gray-700 uppercase">
                            <span>Ready for dispatch</span>
                            <span>Network: Polygon_Main</span>
                        </div>
                    </Card>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-red-500/5 border border-red-500/20 rounded-sm flex gap-3"
                        >
                            <ThreatIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-[10px] font-mono text-red-400 uppercase tracking-tight leading-relaxed">{error}</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Card className="p-3 bg-white/[0.02] border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.05]" onClick={() => setAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')}>
                            <div className="text-[9px] font-mono text-gray-600 uppercase mb-1">Genesis Node</div>
                            <div className="text-[10px] text-white font-mono truncate w-full">0x71C...976F</div>
                        </Card>
                        <Card className="p-3 bg-white/[0.02] border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.05]" onClick={() => setAddress('0x0000000000000000000000000000000000001010')}>
                            <div className="text-[9px] font-mono text-gray-600 uppercase mb-1">PoS Staking</div>
                            <div className="text-[10px] text-white font-mono truncate w-full">0x000...1010</div>
                        </Card>
                    </div>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px]"
                            >
                                <Card className="h-full flex flex-col items-center justify-center p-12 bg-[#050505] relative overflow-hidden">
                                    {/* Scanning Animation */}
                                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/50 animate-scan z-20"></div>
                                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full scale-50 animate-pulse"></div>
                                    
                                    <div className="relative z-10 text-center">
                                        <div className="mb-6 relative inline-block">
                                            <div className="w-16 h-16 border-2 border-blue-500/20 rounded-full flex items-center justify-center">
                                                <SearchIcon className="w-8 h-8 text-blue-500 animate-pulse" />
                                            </div>
                                            <div className="absolute -inset-2 border border-blue-500/10 rounded-full animate-ping opacity-20"></div>
                                        </div>
                                        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-[0.3em] mb-2">Analyzing_Bytecode</h3>
                                        <p className="text-[10px] font-mono text-gray-500 uppercase">Checking reentrancy guards, ownership logic, and gas vectors...</p>
                                        
                                        <div className="mt-8 w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-blue-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 15, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <ResultDisplay content={result.raw} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px]"
                            >
                                <div className="h-full flex flex-col items-center justify-center border border-white/10 border-dashed bg-white/[0.02] p-12 text-center rounded-sm">
                                    <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6">
                                        <ShieldCheckIcon className="w-8 h-8 text-gray-700" />
                                    </div>
                                    <h3 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">No Active Report</h3>
                                    <p className="text-[10px] font-mono text-gray-600 max-w-xs uppercase leading-relaxed">
                                        Input a verified contract address to generate a cryptographic security assessment.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ContractAnalysisView;
