import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';

const OnChainView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async () => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const prompt = `Generate a summary of recent on-chain activity on the Polygon network. Include details about the last 5 blocks (block number, transactions count, gas used) and a summary of 5 recent, interesting transactions (hash, from, to, value, action). Format as a clean, readable Markdown report.`;
        
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
            <h1 className="text-3xl font-bold mb-2">On-Chain Monitor</h1>
            <p className="text-brand-text-light mb-6">Generate a snapshot of recent activity on the Polygon network.</p>
            
            <Button onClick={handleFetch} disabled={isLoading}>
                {isLoading ? 'Fetching Data...' : 'Get Latest Activity'}
            </Button>
            
            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}

            {isLoading && <div className="mt-6"><ViewLoader /></div>}

            {result && (
                <div className="mt-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">On-Chain Activity Report</h2>
                        <ResultDisplay content={result} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default OnChainView;