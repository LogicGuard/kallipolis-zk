import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';
import D3ThreatMap from './D3ThreatMap';

const ThreatIntelView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!query.trim()) {
            setError('Please enter a query (e.g., an address, project name, or threat type).');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const prompt = `Act as a cyber threat intelligence analyst for the Polygon blockchain. The user has provided the following query: "${query}". Provide a detailed threat intelligence report based on this query. If it's an address, check for malicious activity. If it's a project, report known vulnerabilities. If it's a threat type (e.g., "phishing"), describe recent examples on Polygon. Format as Markdown.`;
        
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
            <h1 className="text-3xl font-bold mb-2">Threat Intelligence Center</h1>
            <p className="text-brand-text-light mb-6">Query for real-time threats on the Polygon network.</p>

            <Card className="p-6 max-w-2xl">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter address, project, or threat type..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Querying...' : 'Get Intel'}
                    </Button>
                </div>
            </Card>
            <div className="mt-6">
                <D3ThreatMap />
            </div>

            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}

            {isLoading && <div className="mt-6"><ViewLoader /></div>}

            {result && (
                <div className="mt-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Threat Report</h2>
                        <ResultDisplay content={result} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ThreatIntelView;