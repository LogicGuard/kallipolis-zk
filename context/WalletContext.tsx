
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

// MOVED FROM constants.tsx to break circular dependency
const POLYGON_MAINNET_CHAIN_ID = 137;
const POLYGON_NETWORK_PARAMS = {
    chainId: `0x${POLYGON_MAINNET_CHAIN_ID.toString(16)}`,
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
};

interface WalletContextType {
    account: string | null;
    isAuthenticated: boolean;
    connectWallet: () => Promise<void>;
    signIn: () => Promise<void>;
    disconnectWallet: () => void;
    error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccountsChanged = useCallback((accounts: string[]) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            // If account changes, user needs to sign in again for this new account
            setIsAuthenticated(false); 
        } else {
            setAccount(null);
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, [handleAccountsChanged]);


    const connectWallet = async () => {
        setError(null);
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                handleAccountsChanged(accounts);
                await switchOrAddNetwork();
            } catch (err: any) {
                console.error("User denied account access or error occurred", err);
                if (err.code === 4001) {
                    setError("Connection request rejected.");
                } else {
                    setError("Connection failed.");
                }
            }
        } else {
            setError('MetaMask is not installed.');
        }
    };

    const signIn = async () => {
        if (!account) {
            setError("Please connect your wallet first.");
            return;
        }
        setError(null);
        try {
            const message = `Sign in to Kallipolis ZK to verify ownership of this wallet.\n\nNonce: ${Date.now()}`;
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account],
            });
            // In a real app, we'd verify this signature on the backend
            console.log("Signed message:", { message, signature });
            setIsAuthenticated(true);
        } catch (err: any) {
             console.error("Signature request failed", err);
             if (err.code === 4001) {
                setError("Signature request rejected.");
             } else {
                setError("Sign-in failed.");
             }
        }
    };

    const switchOrAddNetwork = async () => {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== POLYGON_NETWORK_PARAMS.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: POLYGON_NETWORK_PARAMS.chainId }],
                });
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [POLYGON_NETWORK_PARAMS],
                        });
                    } catch (addError) {
                        setError("Failed to add Polygon network.");
                    }
                } else {
                     setError("Failed to switch network.");
                }
            }
        }
    }

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setIsAuthenticated(false);
    }, []);

    return (
        <WalletContext.Provider value={{ account, isAuthenticated, connectWallet, signIn, disconnectWallet, error }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
    