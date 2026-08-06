import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import { analyzeWithGemini } from '../../services/geminiService';
import { useWallet } from '../../context/WalletContext';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import ResultDisplay from '../common/ResultDisplay';

const UserBehaviorPredictorView: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { account } = useWallet();

    const handleAnalyze = async () => {
        const addressToAnalyze = walletAddress.trim() || account;
        if (!addressToAnalyze) {
            setError('Please enter a wallet address or connect your wallet.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const prompt = `Analyze the wallet address ${addressToAnalyze} on the Polygon network to predict future user behavior. Based on its transaction history, token holdings, and DApp interactions, predict the user's likely next actions (e.g., will they invest in DeFi, trade NFTs, become a DAO voter?). Also, identify potential security behaviors (e.g., is this user likely to fall for phishing scams?). Provide a summary of the user profile and behavioral predictions. Format the output in Markdown. This is a speculative analysis based on available data.`;
        
        const { data, error: apiError } = await analyzeWithGemini(prompt);
        
        if (apiError) {
            setError(apiError);
        } else {
            setResult(data);
        }
        setIsLoading(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">User Behavior Predictor</h1>
            <p className="mb-4 text-brand-text-light">Get a speculative analysis of a wallet's likely future actions and security posture.</p>
            <Card className="p-6 max-w-2xl">
                <div className="flex gap-2">
                    <Input 
                        type="text"
                        placeholder="Enter wallet address (or connect wallet)"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="flex-1 font-mono"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Predicting...' : 'Predict User Behavior'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}
            {isLoading && <div className="mt-6"><ViewLoader /></div>}
            {result && !isLoading && (
                <div className="mt-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Behavioral Prediction Report</h2>
                        <ResultDisplay content={result} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UserBehaviorPredictorView;