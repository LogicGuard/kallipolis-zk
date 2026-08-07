import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService'; // Using generic for now
import { StakingAnalysisResult } from '../../types';

const StakingAnalysisView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<StakingAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!address.trim()) {
            setError('Please enter a validator address.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        // This view can be upgraded to a structured schema
        const prompt = `Analyze the Polygon validator at address ${address}. Provide a detailed report covering performance, slashing risk, and reward optimization. Format as Markdown.`;
        const { data, error: apiError } = await analyzeWithGemini(prompt);

        if (apiError) {
            setError(apiError);
        } else {
            // Mock parsing for demonstration, as data is not null
            setResult({
                validatorPerformance: { score: 95, rating: 'Excellent', details: 'Validator has excellent uptime and block production.' },
                slashingRisk: { level: 'Low', details: 'No recent history of slashing incidents.' },
                rewardOptimization: { potential: 'High', suggestions: ['Consider re-staking rewards for compounding effects.'] }
            });
        }
        
        setIsLoading(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Staking Analysis</h1>
            <p className="text-brand-text-light mb-6">Analyze the performance and security of a Polygon validator.</p>

            <Card className="p-6 max-w-2xl">
                 <div className="flex gap-2">
                    <Input 
                        placeholder="Enter validator address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="font-mono flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze Validator'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}

            {isLoading && <div className="mt-6"><ViewLoader /></div>}

             {result && (
                <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                             <h3 className="font-semibold text-lg mb-2">Validator Performance</h3>
                             <p className="text-4xl font-bold">{result.validatorPerformance?.score ?? 0}/100</p>
                             <p className="font-semibold">{result.validatorPerformance?.rating || 'N/A'}</p>
                             <p className="text-sm text-brand-text-light mt-2">{result.validatorPerformance?.details || 'No details available.'}</p>
                        </Card>
                         <Card className="p-6">
                             <h3 className="font-semibold text-lg mb-2">Slashing Risk</h3>
                             <p className="text-4xl font-bold">{result.slashingRisk?.level || 'Unknown'}</p>
                             <p className="text-sm text-brand-text-light mt-2">{result.slashingRisk?.details || 'No details available.'}</p>
                        </Card>
                    </div>
                    <Card className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Reward Optimization</h3>
                        <p className="font-bold text-brand-accent">{result.rewardOptimization?.potential || 'Moderate'} Potential</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-brand-text-light">
                            {(result.rewardOptimization?.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StakingAnalysisView;