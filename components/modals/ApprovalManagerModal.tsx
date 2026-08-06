
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { useWallet } from '../../context/WalletContext';
import { getTokenApprovals, getNamesForAddresses } from '../../services/geminiService';
import { TokenApproval } from '../../types';
import { Input } from '../common/Input';
import SkeletonLoader from '../common/Loader';
import { RefreshIcon, TrashIcon, PlusIcon, ShieldCheckIcon } from '../Icons';

interface ApprovalManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApprovalManagerModal: React.FC<ApprovalManagerModalProps> = ({ isOpen, onClose }) => {
    const { account } = useWallet();
    const [approvals, setApprovals] = useState<TokenApproval[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isRevoking, setIsRevoking] = useState<string | null>(null);
    
    const [tokenAddress, setTokenAddress] = useState('');
    const [spenderAddress, setSpenderAddress] = useState('');
    const [allowance, setAllowance] = useState('');
    const [isGranting, setIsGranting] = useState(false);

    const fetchApprovals = async () => {
        if (!account) return;
        setIsLoading(true);
        setError(null);
        const { data, error: apiError } = await getTokenApprovals(account);
        if (data) setApprovals(data);
        if (apiError) setError(apiError);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen && account) {
            fetchApprovals();
        }
    }, [isOpen, account]);

    const handleRevoke = async (tokenAddr: string, spenderAddr: string) => {
        setIsRevoking(spenderAddr);
        await new Promise(res => setTimeout(res, 1500));
        setApprovals(prev => prev.filter(appr => !(appr.tokenAddress === tokenAddr && appr.spenderAddress === spenderAddr)));
        setIsRevoking(null);
    };

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGranting(true);
        setError(null);
        const { data, error: nameError } = await getNamesForAddresses([tokenAddress, spenderAddress]);
        if(nameError || !data) {
            setError(nameError || "Could not resolve addresses.");
            setIsGranting(false);
            return;
        }

        const newApproval: TokenApproval = {
            tokenName: data[tokenAddress]?.name || 'Unknown Token',
            tokenSymbol: data[tokenAddress]?.symbol || 'TKN',
            tokenAddress,
            spenderName: data[spenderAddress]?.name || 'Unknown Spender',
            spenderAddress,
            allowance
        };
        
        await new Promise(res => setTimeout(res, 1500));
        setApprovals(prev => [newApproval, ...prev]);
        setTokenAddress('');
        setSpenderAddress('');
        setAllowance('');
        setIsAdding(false);
        setIsGranting(false);
    }
    
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[200] p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="w-full flex flex-col max-h-[90vh] bg-[#0C0C0C] border border-white/10 shadow-2xl p-0 overflow-hidden">
                            <div className="p-4 lg:p-5 border-b border-white/10 bg-[#080808] flex justify-between items-center flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                                        <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base lg:text-lg font-bold text-white uppercase tracking-wider">Permits</h2>
                                        <p className="text-[9px] text-gray-500 font-mono uppercase">Permissions Engine</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
                            </div>

                            <div className="p-4 lg:p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#030303]">
                                <div className="flex gap-2 mb-6">
                                    <Button variant="secondary" onClick={() => setIsAdding(!isAdding)} Icon={PlusIcon} className="text-[9px] py-1.5 px-3">
                                        Add Permit
                                    </Button>
                                    <Button variant="secondary" onClick={fetchApprovals} disabled={isLoading} className="text-[10px] !p-1.5">
                                        <RefreshIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>

                                <AnimatePresence>
                                {isAdding && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-6"
                                    >
                                        <div className="p-4 bg-[#080808] border border-white/10 rounded-sm space-y-4">
                                            <form onSubmit={handleGrant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input placeholder="Token (0x...)" value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} required className="text-[10px]"/>
                                                <Input placeholder="Spender (0x...)" value={spenderAddress} onChange={e => setSpenderAddress(e.target.value)} required className="text-[10px]"/>
                                                <div className="flex gap-2 md:col-span-2">
                                                    <Input placeholder="Allowance" value={allowance} onChange={e => setAllowance(e.target.value)} required className="text-[10px] flex-1"/>
                                                    <Button variant="secondary" type="button" onClick={() => setAllowance('115792089237316195423570985008687907853269984665640564039457584007913129639935')} className="text-[8px] whitespace-nowrap px-2">Unlimited</Button>
                                                </div>
                                                <div className="md:col-span-2 text-right">
                                                    <Button type="submit" disabled={isGranting} className="text-[9px] px-8">Grant_Permit</Button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>

                                <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-[9px] font-mono text-gray-500 uppercase bg-[#0A0A0A]">
                                    <div className="col-span-4">Asset</div>
                                    <div className="col-span-4">Spender</div>
                                    <div className="col-span-3">Risk</div>
                                    <div className="col-span-1 text-right">Action</div>
                                </div>

                                {isLoading && <div className="space-y-2 mt-2">{[...Array(3)].map((_,i) => <SkeletonLoader key={i} className="h-14 w-full rounded-none"/>)}</div>}
                                
                                {!isLoading && !error && approvals.length === 0 && (
                                    <div className="mt-8 text-center p-8 border border-dashed border-white/10 opacity-50">
                                        <p className="font-bold text-[10px] uppercase">Secure State</p>
                                    </div>
                                )}

                                {!isLoading && approvals.length > 0 && (
                                    <div className="mt-0 lg:mt-2 space-y-2 lg:space-y-0">
                                        {approvals.map((approval, i) => {
                                            const isUnlimited = approval.allowance.length > 20;
                                            return (
                                                <div key={i} className="flex flex-col lg:grid lg:grid-cols-12 gap-2 lg:gap-4 px-4 py-4 border lg:border-none border-white/5 lg:border-b bg-white/[0.02] lg:bg-transparent items-center hover:bg-white/[0.04] transition-colors rounded-sm lg:rounded-none">
                                                    <div className="col-span-4 w-full lg:w-auto text-left">
                                                        <div className="text-xs font-bold text-white truncate">{approval.tokenName}</div>
                                                        <div className="text-[8px] text-gray-500 font-mono truncate">{approval.tokenAddress}</div>
                                                    </div>
                                                    <div className="col-span-4 w-full lg:w-auto text-left">
                                                        <div className="text-xs text-gray-300 truncate"><span className="lg:hidden text-[9px] text-gray-600 mr-2 uppercase">To:</span>{approval.spenderName}</div>
                                                        <div className="text-[8px] text-gray-500 font-mono truncate">{approval.spenderAddress}</div>
                                                    </div>
                                                    <div className="col-span-3 w-full lg:w-auto flex justify-between lg:block items-center mt-2 lg:mt-0">
                                                        <span className="lg:hidden text-[9px] text-gray-600 uppercase">Exposure:</span>
                                                        <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase ${isUnlimited ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                            {isUnlimited ? 'Unlimited' : 'Limited'}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1 w-full lg:w-auto text-right mt-3 lg:mt-0 pt-3 lg:pt-0 border-t border-white/5 lg:border-none">
                                                        <Button 
                                                            variant="secondary" 
                                                            onClick={() => handleRevoke(approval.tokenAddress, approval.spenderAddress)}
                                                            disabled={isRevoking === approval.spenderAddress}
                                                            className="bg-red-500/5 lg:bg-transparent hover:bg-red-500/20 border-red-500/20 lg:border-none text-red-400 !p-2 rounded-sm w-full lg:w-auto justify-center"
                                                        >
                                                             {isRevoking === approval.spenderAddress ? <div className="w-3 h-3 border-2 border-t-transparent border-red-400 rounded-full animate-spin"></div> : <TrashIcon className="w-4 h-4"/>}
                                                             <span className="lg:hidden ml-2 text-[10px] font-bold">REVOKE PERMIT</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApprovalManagerModal;
