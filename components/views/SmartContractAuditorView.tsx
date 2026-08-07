
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { analyzeSmartContractAudit } from '../../services/geminiService';
import { SmartContractAuditResult } from '../../types';
import { AuditorIcon, CpuIcon, ShieldCheckIcon, ActivityIcon, ZapIcon, ThreatIcon } from '../Icons';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_SOL_YUL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Polygon AggLayer LxLy Exit Root Bridge Verifier (with Yul Inline Assembly)
/// @notice Verifies cryptographic Merkle exit proofs and protects against replay/double-spend
contract AggLayerExitVerifier {
    bytes32 public l1MerkleRoot;
    mapping(bytes32 => bool) public nullifierSpent;

    event ExitProofVerified(uint32 indexed rollupId, bytes32 indexed leafHash, address recipient);

    constructor(bytes32 _initialRoot) {
        l1MerkleRoot = _initialRoot;
    }

    function verifyExitProof(
        uint32 rollupId,
        bytes32 leafHash,
        bytes32[] calldata merkleProof,
        address recipient,
        uint256 amount
    ) external returns (bool valid) {
        bytes32 nullifier = keccak256(abi.encodePacked(rollupId, leafHash));
        require(!nullifierSpent[nullifier], "ERR_NULLIFIER_ALREADY_SPENT");

        bytes32 computedHash = leafHash;
        uint256 proofLength = merkleProof.length;

        // Ultra-optimized Yul (Inline Assembly) loop for Keccak256 Merkle tree hashing
        assembly {
            let ptr := mload(0x40)
            for { let i := 0 } lt(i, proofLength) { i := add(i, 1) } {
                let sibling := calldataload(add(merkleProof.offset, mul(i, 0x20)))
                switch lt(computedHash, sibling)
                case 1 {
                    mstore(ptr, computedHash)
                    mstore(add(ptr, 0x20), sibling)
                }
                default {
                    mstore(ptr, sibling)
                    mstore(add(ptr, 0x20), computedHash)
                }
                computedHash := keccak256(ptr, 0x40)
            }
        }

        require(computedHash == l1MerkleRoot, "ERR_INVALID_MERKLE_EXIT_ROOT");
        nullifierSpent[nullifier] = true;
        emit ExitProofVerified(rollupId, leafHash, recipient);
        return true;
    }
}`;

const SAMPLE_RUST_ZK = `// Kallipolis ZK Rust Stylus / ZK-Rollup State Transition Contract (#![no_std])
// Written in Rust for high-performance execution inside Polygon VM / Arbitrum Stylus
#![no_std]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::{Address, B256, U256, keccak256}, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct ZkStateVerifierContract {
        bytes32 l1_state_root;
        mapping(bytes32 => bool) finalized_rollups;
        uint256 total_verified_batches;
    }
}

#[external]
impl ZkStateVerifierContract {
    pub fn verify_rollup_batch(
        &mut self,
        rollup_id: U256,
        batch_root: B256,
        zk_snark_proof: Vec<u8>
    ) -> Result<bool, Vec<u8>> {
        let commitment = keccak256(&[rollup_id.to_be_bytes_vec(), batch_root.to_vec()].concat());
        
        // Prevent re-processing of finalized batches
        if self.finalized_rollups.get(commitment) {
            return Err("ERR: Rollup batch already finalized in state tree".into());
        }

        // Validate Groth16 / Plonky2 ZK proof integrity via precompile
        let proof_valid = self.verify_groth16_precompile(&zk_snark_proof, batch_root);
        if !proof_valid {
            return Err("ERR: Zero-Knowledge proof signature verification failed".into());
        }

        self.finalized_rollups.insert(commitment, true);
        let current_count = self.total_verified_batches.get();
        self.total_verified_batches.set(current_count + U256::from(1));

        Ok(true)
    }
}`;

const SAMPLE_GO_CONSENSUS = `// Kallipolis ZK Go (Golang) AggLayer LxLy Bridge Consensus Node Validator
package consensus

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"sync"
	"time"
)

type LxLyMerkleValidator struct {
	mu            sync.RWMutex
	L1Commitments map[uint32][]byte
	PendingRoots  map[uint32][]byte
	LastSyncTime  time.Time
}

// ValidateBridgeExitRoot checks balance invariants across L2 chains using Go routines
func (v *LxLyMerkleValidator) ValidateBridgeExitRoot(
	chainID uint32,
	proposedRoot []byte,
	proofSiblings [][]byte,
) (bool, error) {
	v.mu.Lock()
	defer v.mu.Unlock()

	if len(proposedRoot) != 32 {
		return false, errors.New("ERR_INVALID_ROOT_LENGTH: expected 32 bytes")
	}

	computed := proposedRoot
	for i, sibling := range proofSiblings {
		hash := sha256.Sum256(append(computed, sibling...))
		computed = hash[:]
		if i == 0 {
			fmt.Printf("[GO CONSENSUS DEBUG] Sibling %d validated for Chain %d\\n", i, chainID)
		}
	}

	committedRoot, exists := v.L1Commitments[chainID]
	if !exists || string(computed) != string(committedRoot) {
		return false, errors.New("ERR_AGGLAYER_ROOT_MISMATCH: proof does not match L1 state")
	}

	v.LastSyncTime = time.Now().UTC()
	return true, nil
}`;

const SAMPLE_CIRCOM = `// Kallipolis ZK Privacy-Preserving Solvency & AML Regulatory Circuit
// Language: Circom 2.1.8 (ZK-SNARK / Groth16 & Plonky2)
pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template RegulatorySolvencyCircuit(DEPTH) {
    // Private witness inputs (Hidden from public observers)
    signal input userAddress;
    signal input balanceAssetA;
    signal input balanceAssetB;
    signal input amlPathSiblings[DEPTH];
    signal input amlPathIndices[DEPTH];

    // Public inputs (Regulatory thresholds & sanction lists)
    signal input minRequiredTotalUsd;
    signal input sanctionMerkleRoot;

    // Public output claim
    signal output isAccreditedAndSolvent;

    // 1. Verify user solvency without leaking exact asset balance
    signal totalBalance <-- balanceAssetA + balanceAssetB;
    component comp = GreaterEqThan(64);
    comp.in[0] <== totalBalance;
    comp.in[1] <== minRequiredTotalUsd;
    comp.out === 1;

    // 2. Verify non-sanction inclusion in AML Merkle Tree
    component hasher = Poseidon(2);
    hasher.inputs[0] <== userAddress;
    hasher.inputs[1] <== 0; // Null leaf check

    isAccreditedAndSolvent <-- comp.out;
}

component main {public [minRequiredTotalUsd, sanctionMerkleRoot]} = RegulatorySolvencyCircuit(20);`;

const SAMPLE_HUFF = `/// @title Kallipolis ZK Minimal-Gas Vault (Huff EVM Low-Level Assembly)
/// @notice Ultra-efficient EVM bytecode contract eliminating Solidity compiler overhead
/// @author Kallipolis ZK Security Kernel

#define function deposit() payable returns ()
#define function withdraw(uint256) nonpayable returns ()

#define constant BALANCE_SLOT = 0x00
#define constant OWNER_SLOT = 0x01

#define macro DEPOSIT() = takes (0) returns (0) {
    caller              // [msg.sender]
    0x00 mstore         // [] -> store caller in memory
    0x20 0x00 sha3      // [storage_slot] -> keccak256(msg.sender)
    
    dup1 sload          // [current_balance, storage_slot]
    callvalue add       // [new_balance, storage_slot]
    swap1 sstore        // [] -> update balance in storage
    stop
}

#define macro MAIN() = takes (0) returns (0) {
    0x00 calldataload 0xE0 shr // [selector]
    
    dup1 0xd0e30db0 eq deposit_jump jumpi
    dup1 0x2e1a7d4d eq withdraw_jump jumpi
    
    0x00 0x00 revert

    deposit_jump:
        DEPOSIT()
    withdraw_jump:
        0x00 0x00 revert
}`;

const SmartContractAuditorView: React.FC = () => {
    const [activeLang, setActiveLang] = useState<'SOL_YUL' | 'RUST_ZK' | 'GO_NODE' | 'CIRCOM' | 'HUFF'>('SOL_YUL');
    const [code, setCode] = useState(SAMPLE_SOL_YUL);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SmartContractAuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [mockLogs, setMockLogs] = useState<string[]>([]);
    
    const logIntervalRef = useRef<any>(null);

    const logMessages = [
        "INITIALIZING_KERNEL...",
        "DECOMPILING_BYTECODE...",
        "MAPPING_CONTROL_FLOW_GRAPH...",
        "CHECKING_REENTRANCY_VECTORS...",
        "VERIFYING_ACCESS_CONTROL...",
        "OPTIMIZING_GAS_PATHS...",
        "RUNNING_STATIC_ANALYSIS...",
        "GEMINI_INFERENCE_IN_PROGRESS...",
        "GENERATING_FINAL_REPORT..."
    ];

    const handleAnalyze = async () => {
        if (!code.trim()) {
            setError('VALIDATION_ERROR: Source code buffer empty.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        setScanProgress(0);
        setMockLogs([]);

        let logIdx = 0;
        logIntervalRef.current = setInterval(() => {
            if (logIdx < logMessages.length) {
                setMockLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logMessages[logIdx]}`]);
                setScanProgress((logIdx + 1) * (100 / logMessages.length));
                logIdx++;
            }
        }, 800);

        const { data, error: apiError } = await analyzeSmartContractAudit(code);
        
        clearInterval(logIntervalRef.current);
        
        if (apiError) {
            setError(apiError);
        } else {
            setResult(data);
            setScanProgress(100);
        }

        setIsLoading(false);
    };

    const getSeverityStyles = (severity: string) => {
        const s = severity.toLowerCase();
        if (s.includes('critical') || s.includes('high')) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (s.includes('medium')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        if (s.includes('low')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-gray-400 bg-white/5 border-white/10';
    };

    return (
        <div className="min-h-full lg:h-[calc(100vh-140px)] flex flex-col max-w-[1600px] mx-auto pb-10 lg:pb-0">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-sm">
                        <AuditorIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest text-white">Algorithmic Auditor v3</h1>
                        <p className="text-[10px] text-gray-500 font-mono">Formal Verification // Static Analysis Kernel</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 self-end sm:self-auto">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-gray-600 uppercase font-bold font-mono">Kernel_Status</span>
                        <span className="text-[10px] text-green-500 font-mono uppercase">Active_Ready</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-white/10 pl-6">
                        <span className="text-[8px] text-gray-600 uppercase font-bold font-mono">Network</span>
                        <span className="text-[10px] text-blue-400 font-mono uppercase">Polygon_PoS</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* EDITOR SIDE */}
                <div className="lg:col-span-5 flex flex-col h-[400px] lg:h-full overflow-hidden">
                     <div className="bg-[#0A0A0A] border border-white/10 border-b-0 p-2 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] font-mono text-gray-500 rounded-t-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold">
                                {activeLang === 'RUST_ZK' ? 'AGG_STATE_VERIFIER.rs' :
                                 activeLang === 'GO_NODE' ? 'CONSENSUS_VALIDATOR.go' :
                                 activeLang === 'CIRCOM' ? 'REGULATORY_SOLVENCY.circom' :
                                 activeLang === 'HUFF' ? 'GAS_OPTIMIZED_VAULT.huff' :
                                 'AGGLAYER_BRIDGE_EXIT.sol'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${
                                activeLang === 'RUST_ZK' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                activeLang === 'GO_NODE' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                                activeLang === 'CIRCOM' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                activeLang === 'HUFF' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                            }`}>
                                {activeLang === 'RUST_ZK' ? 'RUST (STYLUS / ZK-VM)' :
                                 activeLang === 'GO_NODE' ? 'GO (CONSENSUS NODE)' :
                                 activeLang === 'CIRCOM' ? 'CIRCOM 2.1.8 (ZK)' :
                                 activeLang === 'HUFF' ? 'HUFF (EVM BYTECODE)' :
                                 'SOLIDITY 0.8.28 + YUL'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button 
                                onClick={() => { setActiveLang('SOL_YUL'); setCode(SAMPLE_SOL_YUL); }}
                                className={`px-2 py-0.5 border text-[8px] font-mono transition-all uppercase font-bold ${
                                    activeLang === 'SOL_YUL' ? 'bg-indigo-500 text-black border-indigo-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                                }`}
                            >
                                SOL + YUL
                            </button>
                            <button 
                                onClick={() => { setActiveLang('RUST_ZK'); setCode(SAMPLE_RUST_ZK); }}
                                className={`px-2 py-0.5 border text-[8px] font-mono transition-all uppercase font-bold ${
                                    activeLang === 'RUST_ZK' ? 'bg-orange-500 text-black border-orange-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                                }`}
                            >
                                RUST (ZK)
                            </button>
                            <button 
                                onClick={() => { setActiveLang('GO_NODE'); setCode(SAMPLE_GO_CONSENSUS); }}
                                className={`px-2 py-0.5 border text-[8px] font-mono transition-all uppercase font-bold ${
                                    activeLang === 'GO_NODE' ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                                }`}
                            >
                                GO (NODE)
                            </button>
                            <button 
                                onClick={() => { setActiveLang('CIRCOM'); setCode(SAMPLE_CIRCOM); }}
                                className={`px-2 py-0.5 border text-[8px] font-mono transition-all uppercase font-bold ${
                                    activeLang === 'CIRCOM' ? 'bg-purple-500 text-white border-purple-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                                }`}
                            >
                                CIRCOM
                            </button>
                            <button 
                                onClick={() => { setActiveLang('HUFF'); setCode(SAMPLE_HUFF); }}
                                className={`px-2 py-0.5 border text-[8px] font-mono transition-all uppercase font-bold ${
                                    activeLang === 'HUFF' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
                                }`}
                            >
                                HUFF
                            </button>
                        </div>
                    </div>
                     <Card className="p-0 flex-1 relative flex flex-col cyber-card overflow-hidden">
                        <div className="absolute inset-0 bg-[#020202] pointer-events-none"></div>
                        <Textarea 
                            placeholder='// INJECT SOURCE CODE FOR AUDIT...'
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="font-mono text-xs bg-transparent border-none focus:ring-0 resize-none h-full p-6 leading-relaxed text-gray-300 z-10 custom-scrollbar"
                        />
                        
                        {!code && (
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <CpuIcon className="w-24 lg:w-32 h-24 lg:h-32 text-white" />
                             </div>
                        )}

                        <div className="absolute bottom-4 right-4 z-20">
                            <Button 
                                onClick={handleAnalyze} 
                                disabled={isLoading} 
                                className="!px-6 lg:!px-10 py-3 lg:py-4 shadow-2xl bg-white text-black hover:bg-gray-200 border-none group text-[10px]"
                            >
                                <span className="flex items-center gap-2 lg:gap-3 uppercase">
                                    {isLoading ? 'Analyzing' : 'Execute_Audit'}
                                    <ActivityIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                                </span>
                            </Button>
                        </div>
                    </Card>
                </div>
            
                {/* OUTPUT SIDE */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-0">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col gap-4"
                            >
                                <Card className="flex-1 cyber-card p-6 bg-[#050505] flex flex-col font-mono text-[10px]">
                                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-blue-500 animate-pulse rounded-sm"></div>
                                            <span className="text-white font-bold uppercase tracking-widest">Processing_Uplink</span>
                                        </div>
                                        <span className="text-blue-400">{Math.round(scanProgress)}%</span>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto space-y-1 text-gray-500 custom-scrollbar pr-2">
                                        {mockLogs.map((log, i) => (
                                            <div key={i} className="flex gap-4">
                                                <span className="opacity-20 select-none">L_0{i+1}</span>
                                                <span className={i === mockLogs.length - 1 ? 'text-white' : ''}>{log}</span>
                                            </div>
                                        ))}
                                        <div className="animate-pulse inline-block w-2 h-3 bg-blue-500 ml-11 mt-1"></div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-blue-500"
                                                animate={{ width: `${scanProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col overflow-y-auto custom-scrollbar pr-2 space-y-6"
                            >
                                {/* Summary HUD */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-4 bg-[#080808] border-white/10 flex flex-col justify-center items-center text-center">
                                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">Security_Score</span>
                                        <div className={`text-4xl font-black font-mono ${result.securityScore > 80 ? 'text-green-500' : result.securityScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {result.securityScore}
                                        </div>
                                    </Card>
                                    <Card className="p-4 bg-[#080808] border-white/10 flex flex-col justify-center items-center text-center">
                                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">Risk_Level</span>
                                        <div className={`text-xl font-black font-mono uppercase ${result.riskLevel === 'Low' ? 'text-green-500' : 'text-red-500'}`}>
                                            {result.riskLevel}
                                        </div>
                                    </Card>
                                    <Card className="p-4 bg-blue-500/5 border-blue-500/20 flex flex-col justify-center">
                                        <p className="text-[9px] font-mono text-gray-400 leading-tight italic">
                                            <span className="text-blue-500 font-bold mr-1">Summary:</span>
                                            {result.summary}
                                        </p>
                                    </Card>
                                </div>

                                {/* Vulnerabilities Breakdown */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2 border-l-2 border-red-500 pl-4">
                                        <ThreatIcon className="w-5 h-5 text-red-500" />
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Security_Vulnerabilities</h2>
                                    </div>
                                    
                                    {(!result.vulnerabilities || result.vulnerabilities.length === 0) ? (
                                        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-sm text-center">
                                            <ShieldCheckIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-xs font-mono text-green-400 uppercase">No Immediate Vulnerabilities Detected</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {(result.vulnerabilities || []).map((v, i) => (
                                                <Card key={i} className={`p-4 border group hover:scale-[1.01] transition-all ${getSeverityStyles(v.severity)}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xs font-black uppercase tracking-tight">{v.title}</h3>
                                                        <span className="text-[8px] font-bold px-2 py-0.5 border border-current rounded-sm uppercase tracking-widest">
                                                            {v.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-mono opacity-70 leading-relaxed">{v.description}</p>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Gas Optimizations Breakdown */}
                                <div className="space-y-4 pb-12">
                                    <div className="flex items-center gap-3 mb-2 border-l-2 border-yellow-500 pl-4">
                                        <ZapIcon className="w-5 h-5 text-yellow-500" />
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Gas_Optimization_Buffer</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                        {(result.gasOptimizations || []).map((g, i) => (
                                            <Card key={i} className="p-4 bg-white/[0.02] border-white/5 group hover:border-yellow-500/30 transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-[11px] font-bold text-gray-200 uppercase">{g.suggestion}</h3>
                                                    <span className="text-[9px] font-mono text-yellow-500 font-bold">Est. Save: {g.estimatedSaving}</span>
                                                </div>
                                                <p className="text-[10px] font-mono text-gray-500 leading-relaxed">{g.details}</p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                className="h-full flex items-center justify-center border border-white/5 border-dashed bg-white/[0.01] rounded-sm"
                            >
                                <div className="text-center opacity-30">
                                    <CpuIcon className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 text-gray-600" />
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">Awaiting_Input_Buffer</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SmartContractAuditorView;
