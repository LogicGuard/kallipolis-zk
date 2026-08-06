const fs = require('fs');
let code = fs.readFileSync('components/views/ThreatIntelView.tsx', 'utf8');

// Add import
if (!code.includes('D3ThreatMap')) {
    code = code.replace("import ResultDisplay from '../common/ResultDisplay';", "import ResultDisplay from '../common/ResultDisplay';\nimport D3ThreatMap from './D3ThreatMap';");
    
    // Add component below the search box
    code = code.replace("</Card>", "</Card>\n            <div className=\"mt-6\">\n                <D3ThreatMap />\n            </div>");
    
    fs.writeFileSync('components/views/ThreatIntelView.tsx', code);
    console.log("Updated Threat Intel View");
}
