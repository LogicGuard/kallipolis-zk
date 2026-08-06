const fs = require('fs');
let code = fs.readFileSync('components/views/SmartContractFirewallView.tsx', 'utf8');

// Add autoRemediation state
code = code.replace("const [firewallLang, setFirewallLang] = useState<'RUST_EBPF' | 'GO_DAEMON' | 'YUL_GUARD'>('RUST_EBPF');", "const [firewallLang, setFirewallLang] = useState<'RUST_EBPF' | 'GO_DAEMON' | 'YUL_GUARD'>('RUST_EBPF');\n    const [autoRemediation, setAutoRemediation] = useState(true);\n    const [remediationLog, setRemediationLog] = useState<string | null>(null);");

// Add handleAutoRemediation function
code = code.replace("const handleAnalyze = async () => {", `const handleAutoRemediation = async () => {
        try {
            const res = await fetch('/api/v1/remediation/pause-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractAddress: toAddress })
            });
            const data = await res.json();
            setRemediationLog(\`AUTO-REMEDIATION SUCCESS: \${data.message} [TX: \${data.txHash}]\`);
        } catch (e) {
            setRemediationLog('AUTO-REMEDIATION FAILED.');
        }
    };

    const handleAnalyze = async () => {`);

// Modify handleAnalyze to trigger auto-remediation if Blocked
code = code.replace("setResult(result.data);", `setResult(result.data);
            if (result.data.status === 'Blocked' && autoRemediation) {
                setLogs(prev => [...prev, 'CRITICAL THREAT DETECTED. INITIATING AUTO-REMEDIATION...']);
                handleAutoRemediation();
            }`);
            
// Add Toggle to UI
const uiToggle = `
                        <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/10 px-4 py-2 rounded-sm">
                            <span className="text-[10px] font-mono text-gray-400 uppercase">Auto-Remediation (Defender Integration)</span>
                            <button 
                                onClick={() => setAutoRemediation(!autoRemediation)}
                                className={\`w-10 h-4 rounded-full flex items-center transition-colors \${autoRemediation ? 'bg-green-500/20' : 'bg-gray-800'}\`}
                            >
                                <div className={\`w-3 h-3 rounded-full transition-transform \${autoRemediation ? 'bg-green-500 translate-x-6' : 'bg-gray-500 translate-x-1'}\`}></div>
                            </button>
                        </div>
                    </div>`;

code = code.replace('<p className="text-gray-400 mt-1 font-mono text-xs">Pre-Execution EVM Memory Inspection</p>\n                </div>', '<p className="text-gray-400 mt-1 font-mono text-xs">Pre-Execution EVM Memory Inspection</p>\n                </div>' + uiToggle);

// Add remediation log to UI
code = code.replace('<div className="mt-4 grid grid-cols-2 gap-4">', `{remediationLog && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-400 uppercase tracking-widest break-all">
                                        {remediationLog}
                                    </div>
                                )}
                                <div className="mt-4 grid grid-cols-2 gap-4">`);

fs.writeFileSync('components/views/SmartContractFirewallView.tsx', code);
console.log("Updated Firewall View");
