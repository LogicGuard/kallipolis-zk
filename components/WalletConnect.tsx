import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import Button from './common/Button';
import { WalletIcon, DisconnectIcon } from './Icons';
import ApprovalManagerModal from './modals/ApprovalManagerModal';

const WalletConnect: React.FC = () => {
    const { account, connectWallet, disconnectWallet, signIn, isAuthenticated, error } = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    return (
        <div className="flex items-center space-x-2">
            {account ? (
                isAuthenticated ? (
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                            Manage Approvals
                        </Button>
                        <div className="glass-card px-3 py-2 text-sm font-mono flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                            {formatAddress(account)}
                        </div>
                        <Button variant="secondary" onClick={disconnectWallet} title="Disconnect">
                            <DisconnectIcon className="w-5 h-5"/>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={signIn}>
                            Sign In
                        </Button>
                        <div className="glass-card px-3 py-2 text-sm font-mono flex items-center">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                            {formatAddress(account)}
                        </div>
                        <Button variant="secondary" onClick={disconnectWallet} title="Disconnect">
                            <DisconnectIcon className="w-5 h-5"/>
                        </Button>
                    </>
                )
            ) : (
                <Button onClick={connectWallet} Icon={WalletIcon}>
                    Connect Wallet
                </Button>
            )}
             {error && <p className="text-red-500 text-sm ml-4 fixed bottom-5 right-5 glass-card p-3">{error}</p>}
            
            {account && <ApprovalManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default WalletConnect;