import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { analyzeWithGemini } from '../../services/geminiService';
import ResultDisplay from '../common/ResultDisplay';

const AnalyticsView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!query.trim()) {
            setError('Please enter a question.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        const prompt = `You are a data analyst with access to a database of Polygon security events. The user asks: "${query}". Answer their question based on hypothetical, but realistic, security data. Provide a clear, concise answer. Use lists or tables if appropriate. Format as Markdown.`;
        
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
            <h1 className="text-3xl font-bold mb-2">Security Analytics</h1>
            <p className="text-brand-text-light mb-6">Ask a question about Polygon security trends and get an AI-powered answer.</p>
            
            <Card className="p-6 max-w-2xl">
                <div className="flex gap-2">
                    <Input 
                        placeholder="e.g., What was the most common vulnerability last month?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Ask'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="mt-6 p-4 bg-red-500/10 border-red-500/30"><p className="text-red-400">{error}</p></Card>}

            {isLoading && <div className="mt-6"><ViewLoader /></div>}

            {result && (
                <div className="mt-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Analytical Insight</h2>
                        <ResultDisplay content={result} />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AnalyticsView;