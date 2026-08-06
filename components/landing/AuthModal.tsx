import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { PolygonIcon, WalletIcon, ShieldCheckIcon, CpuIcon } from '../Icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode: 'login' | 'signup';
    onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'SELECT_WALLET' | 'CONNECTING' | 'SIWE_SIGN' | 'TOKEN_GATE' | 'SUCCESS'>('SELECT_WALLET');
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('SELECT_WALLET');
            setSelectedWallet(null);
        }
    }, [isOpen]);

    const handleSelectWallet = (wallet: string) => {
        setSelectedWallet(wallet);
        setStep('CONNECTING');
        setTimeout(() => setStep('SIWE_SIGN'), 1500);
    };

    const handleSign = () => {
        setStep('TOKEN_GATE');
        setTimeout(() => {
            setStep('SUCCESS');
            setTimeout(() => {
                onSuccess();
            }, 1000);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm"
                >
                    <Card className="p-0 bg-[#0A0A0A] border border-white/10 relative overflow-hidden shadow-2xl rounded-xl">
                        
                        {/* Header */}
                        <div className="bg-[#050505] p-6 border-b border-white/5 flex flex-col items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 blur-3xl"></div>
                            <PolygonIcon className="w-10 h-10 text-white mb-4 relative z-10" />
                            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-widest relative z-10">
                                Identity Matrix
                            </h2>
                            <p className="text-[10px] text-gray-500 font-mono mt-1 relative z-10 tracking-widest">
                                WEB3_AUTH // SIWE_PROTOCOL
                            </p>
                        </div>

                        <div className="p-6 min-h-[250px] flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                
                                {step === 'SELECT_WALLET' && (
                                    <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                                        <p className="text-xs text-gray-400 font-mono text-center mb-6 uppercase tracking-wider">Select Wallet Provider</p>
                                        
                                        <button onClick={() => handleSelectWallet('MetaMask')} className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg flex items-center justify-between transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                                                    <WalletIcon className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">MetaMask</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </button>

                                        <button onClick={() => handleSelectWallet('WalletConnect v2')} className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 rounded-lg flex items-center justify-between transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                    <CpuIcon className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">WalletConnect v2</span>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}

                                {step === 'CONNECTING' && (
                                    <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
                                        <div className="w-16 h-16 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                                        <p className="text-sm font-mono text-gray-300 uppercase tracking-widest">Handshake with {selectedWallet}</p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-2">Awaiting Session Proposal...</p>
                                    </motion.div>
                                )}

                                {step === 'SIWE_SIGN' && (
                                    <motion.div key="siwe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                            <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Sign-In with Ethereum</h3>
                                        <p className="text-xs text-gray-400 font-mono mb-6 leading-relaxed">
                                            Click "Sign" in your wallet to verify ownership of this address. No gas fees will be charged.
                                        </p>
                                        <button onClick={handleSign} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors">
                                            Simulate Signature
                                        </button>
                                    </motion.div>
                                )}

                                {step === 'TOKEN_GATE' && (
                                    <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6">
                                        <CpuIcon className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Checking Token Gates</h3>
                                        <p className="text-[10px] text-gray-500 font-mono text-center">
                                            Verifying Institutional Access NFT / Staked PGUARD Balance...
                                        </p>
                                        <div className="w-full bg-white/5 h-1 mt-6 rounded-full overflow-hidden">
                                            <div className="bg-purple-500 h-full w-2/3 animate-pulse"></div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'SUCCESS' && (
                                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                                            <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-2">Access Granted</h3>
                                        <p className="text-[10px] text-gray-500 font-mono">Redirecting to Sentinel Dashboard...</p>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                        
                        {/* Footer Status */}
                        <div className="bg-[#030303] py-3 px-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600 uppercase">
                            <span>EIP-4361 Compliant</span>
                            <span>Kallipolis ZK SecOps</span>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthModal;
