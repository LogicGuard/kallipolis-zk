import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';

const DAppCertificationView: React.FC = () => {
    const [dappIdentifier, setDappIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!dappIdentifier.trim()) {
            setError('Please enter a dApp contract address or URL.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        const prompt = `Perform a security certification audit for the Polygon dApp identified by "${dappIdentifier}". Evaluate it on over 100 security aspects including smart contract safety, frontend security, and infrastructure reliability. Provide a final security score (0-100) and a status ('Certified' if score >= 85, otherwise 'Not Certified'). List the top 5 passed security checks and top 5 areas for improvement. Format as a professional Markdown report.`;
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
            <h1 className="text-3xl font-bold mb-2">DApp Security Certification</h1>
            <p className="text-brand-text-light mb-6">Evaluate a dApp's security posture and check for the "Polygon Secured" certification.</p>

             <Card className="p-6 max-w-2xl">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter dApp contract address or URL..."
                        value={dappIdentifier}
                        onChange={(e) => setDappIdentifier(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Evaluating...' : 'Evaluate DApp'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}

            {isLoading && <div className="mt-6"><ViewLoader /></div>}

            {result && (
                <div className="mt-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Certification Report</h2>
                        <ResultDisplay content={result} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DAppCertificationView;