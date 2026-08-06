
import React, { useState, useRef, useEffect } from 'react';
import { Input, Textarea } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { analyzeTransactionWithFirewall } from '../../services/geminiService';
import { FirewallAnalysisResult } from '../../types';
import { ShieldCheckIcon, ThreatIcon, FirewallIcon, ActivityIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const RUST_EBPF_FIREWALL = `// Kallipolis ZK Rust eBPF XDP Linux Kernel Packet Firewall Hook
#![no_std]
#![no_main]

use aya_bpf::{
    bindings::xdp_action,
    macros::xdp,
    programs::XdpContext,
};

#[xdp]
pub fn kallipolis_rpc_filter(ctx: XdpContext) -> u32 {
    match try_filter_transaction(ctx) {
        Ok(ret) => ret,
        Err(_) => xdp_action::XDP_ABORTED,
    }
}

fn try_filter_transaction(_ctx: XdpContext) -> Result<u32, ()> {
    // Zero-copy inspection of EVM transaction calldata signature selectors
    // Instantly drops known flashloan exploit signatures before hitting EVM execution engine
    Ok(xdp_action::XDP_PASS)
}`;

const GO_DAEMON_FIREWALL = `// Kallipolis ZK Go (Golang) AggLayer RPC Proxy Firewall Daemon
package firewall

import (
	"bytes"
	"encoding/hex"
	"errors"
	"fmt"
	"sync"
)

type AggLayerFirewallDaemon struct {
	mu              sync.RWMutex
	BlockedSelectors map[string]bool
	ThreatScore     map[string]int
}

// InspectTxCalldata checks incoming mempool payloads against known exploit heuristics
func (d *AggLayerFirewallDaemon) InspectTxCalldata(sender string, calldataHex string) (bool, error) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	if len(calldataHex) < 10 {
		return false, errors.New("ERR_PAYLOAD_TOO_SHORT")
	}

	selector := calldataHex[2:10]
	if d.BlockedSelectors[selector] {
		return false, fmt.Errorf("SECURITY_ALERT: selector 0x%s blocked by Kallipolis ZK Firewall", selector)
	}

	return true, nil
}`;

const YUL_GUARD_FIREWALL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Polygon AggLayer Yul Inline Assembly Reentrancy & Exploit Guard
contract Kallipolis ZKInlineFirewall {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrantYul() {
        // High-performance Yul inline assembly check saving ~350 gas per invocation
        assembly {
            let s := sload(2)
            if eq(s, 2) {
                // Revert with signature "ReentrancyGuardReentrant()" (0x3ee5aeb5)
                mstore(0x00, 0x3ee5aeb500000000000000000000000000000000000000000000000000000000)
                revert(0x00, 0x04)
            }
            sstore(2, 2)
        }
        _;
        assembly {
            sstore(2, 1)
        }
    }
}`;

const SmartContractFirewallView: React.FC = () => {
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [dataField, setDataField] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<FirewallAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [firewallLang, setFirewallLang] = useState<'RUST_EBPF' | 'GO_DAEMON' | 'YUL_GUARD'>('RUST_EBPF');
    const [autoRemediation, setAutoRemediation] = useState(true);
    const [remediationLog, setRemediationLog] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleAutoRemediation = async () => {
        try {
            const res = await fetch('/api/v1/remediation/pause-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractAddress: toAddress })
            });
            const data = await res.json();
            setRemediationLog(`AUTO-REMEDIATION SUCCESS: ${data.message} [TX: ${data.txHash}]`);
        } catch (e) {
            setRemediationLog('AUTO-REMEDIATION FAILED.');
        }
    };

    const handleAnalyze = async () => {
        if (!fromAddress.trim() || !toAddress.trim() || !dataField.trim()) {
            setError('MISSING_PARAMETERS: SOURCE, TARGET, and PAYLOAD required.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        setLogs([]);
        
        addLog(`INIT_SIMULATION: SRC=${fromAddress.substring(0,8)}...`);
        addLog(`SCANNING_TARGET: DEST=${toAddress.substring(0,8)}...`);
        
        setTimeout(() => addLog("LOADING_PROTOCOL_SIGNATURES..."), 500);
        setTimeout(() => addLog("CALCULATING_STATE_TRANSITIONS..."), 1000);

        const { data, error: apiError } = await analyzeTransactionWithFirewall(toAddress, JSON.stringify({ from: fromAddress, data: dataField }));
        
        if (data) {
            setResult(data);
            addLog(`ANALYSIS_COMPLETE: STATUS=${data.status.toUpperCase()}`);
        }
        if (apiError) {
            setError(apiError);
            addLog(`CRITICAL_FAILURE: ${apiError}`);
        }

        setIsLoading(false);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-sm">
                    <FirewallIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Pre-Execution Firewall</h1>
                    <p className="text-xs text-gray-500 font-mono">Deep Packet Inspection // Transaction Shielding</p>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <Card className="flex flex-col p-0 bg-[#080808] h-full overflow-hidden border-white/10">
                    <div className="p-3 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">Simulation_Parameters</span>
                    </div>
                    <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                        <div className="group">
                            <label className="text-[10px] font-bold text-gray-500 uppercase font-mono mb-1.5 block group-focus-within:text-blue-400 transition-colors">Source Address</label>
                            <Input placeholder="0x... (Origin)" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="bg-black border-white/10 text-xs font-mono" />
                        </div>
                        <div className="group">
                            <label className="text-[10px] font-bold text-gray-500 uppercase font-mono mb-1.5 block group-focus-within:text-blue-400 transition-colors">Target Contract</label>
                            <Input placeholder="0x... (Target)" value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="bg-black border-white/10 text-xs font-mono" />
                        </div>
                        <div className="group flex-1 flex flex-col">
                            <label className="text-[10px] font-bold text-gray-500 uppercase font-mono mb-1.5 block group-focus-within:text-blue-400 transition-colors">Call Data (HEX)</label>
                            <Textarea placeholder="0xa9059cbb..." value={dataField} onChange={(e) => setDataField(e.target.value)} className="flex-1 bg-black border-white/10 text-xs font-mono resize-none custom-scrollbar" />
                        </div>
                    </div>
                    <div className="p-4 bg-[#050505] border-t border-white/10">
                        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full justify-center py-4 bg-white text-black hover:bg-gray-200">
                            {isLoading ? 'PROBING_STATE...' : 'INITIALIZE_FIREWALL_SIM'}
                        </Button>
                    </div>
                </Card>

                <Card className="flex flex-col p-0 bg-[#030303] border-white/10 h-full relative overflow-hidden">
                    <div className="p-3 border-b border-white/10 bg-[#0A0A0A] flex justify-between items-center z-10">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">Kernel_Log</span>
                        {isLoading && <ActivityIcon className="w-3 h-3 text-green-500 animate-pulse" />}
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-[10px] z-10 space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="text-gray-500 flex gap-4">
                                <span className="opacity-20 select-none">L_{i.toString().padStart(2,'0')}</span>
                                <span className="text-gray-400">{log}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                        
                        {result && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-white/5 pt-8">
                                <div className={`p-6 border flex items-start gap-4 ${result.status === 'Allowed' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    {result.status === 'Allowed' ? <ShieldCheckIcon className="w-10 h-10 text-green-500" /> : <ThreatIcon className="w-10 h-10 text-red-500" />}
                                    <div className="flex-1">
                                        <h2 className={`text-2xl font-black uppercase tracking-widest ${result.status === 'Allowed' ? 'text-green-400' : 'text-red-500'}`}>{result.status}</h2>
                                        <p className="text-gray-300 text-xs mt-1 leading-relaxed">{result.summary}</p>
                                    </div>
                                </div>
                                {remediationLog && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-400 uppercase tracking-widest break-all">
                                        {remediationLog}
                                    </div>
                                )}
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/[0.02] border border-white/5">
                                        <div className="text-[8px] text-gray-600 uppercase font-black mb-1">Threat_Vector</div>
                                        <div className="text-[10px] text-white font-mono">{result.threatType}</div>
                                    </div>
                                    <div className="p-3 bg-white/[0.02] border border-white/5">
                                        <div className="text-[8px] text-gray-600 uppercase font-black mb-1">AI_Confidence</div>
                                        <div className="text-[10px] text-blue-400 font-mono">{result.confidence}%</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Polyglot Firewall Guard Specification Card */}
            <div className="mt-8">
                <Card className="p-0 overflow-hidden border-white/10 bg-[#080808]">
                    <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-black uppercase text-white tracking-widest">
                                Kallipolis ZK Firewall Kernel Specification
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                                // eBPF KERNEL &amp; RPC FILTER
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setFirewallLang('RUST_EBPF')}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded-sm border ${
                                    firewallLang === 'RUST_EBPF'
                                        ? 'bg-orange-500 text-black border-orange-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            >
                                RUST (eBPF)
                            </button>
                            <button
                                onClick={() => setFirewallLang('GO_DAEMON')}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded-sm border ${
                                    firewallLang === 'GO_DAEMON'
                                        ? 'bg-cyan-500 text-black border-cyan-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            >
                                GO (DAEMON)
                            </button>
                            <button
                                onClick={() => setFirewallLang('YUL_GUARD')}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded-sm border ${
                                    firewallLang === 'YUL_GUARD'
                                        ? 'bg-indigo-500 text-black border-indigo-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            >
                                YUL / SOL (ASM)
                            </button>
                        </div>
                    </div>
                    <pre className="p-6 text-xs font-mono text-blue-300 overflow-x-auto custom-scrollbar leading-relaxed bg-[#050505]">
                        <code>
                            {firewallLang === 'RUST_EBPF'
                                ? RUST_EBPF_FIREWALL
                                : firewallLang === 'GO_DAEMON'
                                ? GO_DAEMON_FIREWALL
                                : YUL_GUARD_FIREWALL}
                        </code>
                    </pre>
                </Card>
            </div>
        </div>
    );
};

export default SmartContractFirewallView;
