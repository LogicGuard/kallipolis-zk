import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeQuantumResistance } from '../../services/geminiService';
import { QuantumAnalysisResult } from '../../types';

const QuantumSecurityView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<QuantumAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!address.trim()) {
            setError('Please enter a contract address.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const { data, error: apiError } = await analyzeQuantumResistance(address);
        if (data) setResult(data);
        if (apiError) setError(apiError);

        setIsLoading(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Quantum-Resistant Security</h1>
            <p className="text-brand-text-light mb-6">Analyze a contract's resilience against future quantum computing threats.</p>

            <Card className="p-6 max-w-2xl mb-6">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter contract address to analyze..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="font-mono flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze Quantum Readiness'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="p-4 bg-red-500/10 border-red-500/30 text-red-400">{error}</Card>}

            {isLoading && <ViewLoader />}

            {result && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Quantum Readiness Report</h2>
                         <div className={`p-4 rounded-lg mb-4 ${result.readinessStatus === 'Quantum-Resistant' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                            <p className="font-bold text-lg">Status: {result.readinessStatus}</p>
                            <p className="text-sm">{result.summary}</p>
                        </div>
                    </Card>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="p-6">
                            <h3 className="font-semibold mb-3">Vulnerable Components</h3>
                            <ul className="space-y-2">
                                {result.vulnerableComponents.map((item, i) => (
                                    <li key={i} className="text-sm">
                                        <strong className="text-brand-accent">{item.component}:</strong>
                                        <p className="text-brand-text-light">{item.detail}</p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold mb-3">Post-Quantum Recommendations</h3>
                            <ul className="space-y-2">
                               {result.pqcRecommendations.map((item, i) => (
                                    <li key={i} className="text-sm">
                                        <strong className="text-brand-accent">{item.algorithm}:</strong>
                                        <p className="text-brand-text-light">{item.useCase}</p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                     <Card className="p-6">
                        <h3 className="font-semibold mb-3">Suggested Migration Path</h3>
                        <p className="text-sm text-brand-text-light">{result.migrationPath}</p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default QuantumSecurityView;