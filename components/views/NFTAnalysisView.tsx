import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';

const NFTAnalysisView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!address.trim()) {
            setError('Please enter an NFT contract address.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        const prompt = `Analyze the Polygon NFT collection at contract address ${address}. Provide a report covering: contract security score (0-100), estimated floor value (in MATIC), insurability rating, a security audit checklist, and investment insights (pros and cons). Format as Markdown.`;
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
            <h1 className="text-3xl font-bold mb-2">NFT Security & Value Analysis</h1>
            <p className="text-brand-text-light mb-6">Get an AI-powered security and investment analysis for any Polygon NFT collection.</p>
            
            <Card className="p-6 max-w-2xl">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter NFT contract address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="font-mono flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze Collection'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}

            {isLoading && <div className="mt-6"><ViewLoader /></div>}

            {result && (
                <div className="mt-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">NFT Analysis Report</h2>
                        <ResultDisplay content={result} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default NFTAnalysisView;