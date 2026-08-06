import React from 'react';
import Card from '../common/Card';

interface ViewPlaceholderProps {
    title: string;
}

const ViewPlaceholder: React.FC<ViewPlaceholderProps> = ({ title }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-brand-text-light mb-8">This feature is under active development.</p>
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold">Coming Soon!</h2>
                <p className="text-brand-text-light mt-2">A new and improved user experience for this tool is being crafted.</p>
            </Card>
        </div>
    );
};

export default ViewPlaceholder;