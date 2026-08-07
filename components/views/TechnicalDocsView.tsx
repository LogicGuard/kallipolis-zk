
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import Card from '../common/Card';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
    CpuIcon, GlobeIcon, LayersIcon, SearchIcon, ZapIcon, ActivityIcon, ComplianceIcon,
    BookIcon, CodeIcon, ClockIcon, ChevronDownIcon, CheckCircleIcon, TrendingUpIcon, 
    ShieldCheckIcon, AuditorIcon, FirewallIcon, StarIcon, PlusIcon, WalletIcon
} from '../Icons';
import ResultDisplay from '../common/ResultDisplay';
import { useNavigation } from '../../context/NavigationContext';
import Button from '../common/Button';

interface DocArticle {
    id: string;
    title: string;
    icon: React.FC<any>;
    sphere: 'Core_Logic' | 'Infrastructure' | 'Security_Ops' | 'Dev_Resources' | 'Compliance';
    readTime: string;
    version: string;
    content: string;
    status: 'Verified' | 'Beta' | 'Internal';
    author: string;
    schematicId: string;
}

const ArchitectureDiagram: React.FC<{ onNavigate: (id: string) => void }> = ({ onNavigate }) => {
    const nodes = [
        { id: 'signal', label: 'Signal_Ingestion', x: 100, y: 250, icon: WalletIcon, target: 'mission-architecture' },
        { id: 'kernel', label: 'Heuristic_Kernel', x: 300, y: 150, icon: CpuIcon, target: 'heuristic-kernel' },
        { id: 'sop', label: 'Defense_SOP', x: 300, y: 350, icon: ActivityIcon, target: 'soc-sop' },
        { id: 'agglayer', label: 'AggLayer_Sync', x: 500, y: 250, icon: LayersIcon, target: 'agglayer-protocol' },
        { id: 'zk', label: 'ZK_Compliance', x: 700, y: 250, icon: ShieldCheckIcon, target: 'compliance-zk' },
    ];

    const connections = [
        { from: 'signal', to: 'kernel' },
        { from: 'signal', to: 'sop' },
        { from: 'kernel', to: 'agglayer' },
        { from: 'sop', to: 'agglayer' },
        { from: 'agglayer', to: 'zk' },
    ];

    return (
        <div className="my-12 p-8 bg-[#050505] border border-white/10 rounded-sm relative overflow-hidden group/diag shadow-2xl">
            <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-flicker"></div>
                    <span className="text-[10px] font-mono text-gray-400 font-black uppercase tracking-[0.3em]">Interactive_System_Schematic</span>
                </div>
            </div>

            <svg viewBox="0 0 800 500" className="w-full h-auto relative z-10 overflow-visible">
                {connections.map((conn, i) => {
                    const fromNode = nodes.find(n => n.id === conn.from)!;
                    const toNode = nodes.find(n => n.id === conn.to)!;
                    return (
                        <g key={i}>
                            <motion.path 
                                d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                                stroke="rgba(59, 130, 246, 0.1)"
                                strokeWidth="1.5"
                                fill="none"
                            />
                            <motion.circle r="2" fill="#3b82f6">
                                <animateMotion 
                                    dur={`${2 + Math.random() * 2}s`} 
                                    repeatCount="indefinite" 
                                    path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`} 
                                />
                            </motion.circle>
                        </g>
                    );
                })}

                {nodes.map((node) => (
                    <motion.g 
                        key={node.id}
                        className="cursor-pointer group/node"
                        onClick={() => onNavigate(node.target)}
                        whileHover={{ scale: 1.05 }}
                    >
                        <circle cx={node.x} cy={node.y} r="35" fill="#0A0A0A" stroke="rgba(255,255,255,0.05)" strokeWidth="1" className="group-hover/node:stroke-blue-500/50 transition-colors" />
                        <foreignObject x={node.x - 15} y={node.y - 15} width="30" height="30">
                            <div className="w-full h-full flex items-center justify-center">
                                <node.icon className="w-6 h-6 text-blue-400 group-hover/node:text-white transition-colors" />
                            </div>
                        </foreignObject>
                        <text x={node.x} y={node.y + 55} textAnchor="middle" fill="#555" className="text-[9px] font-mono font-black uppercase tracking-widest group-hover/node:fill-white transition-colors">
                            {node.label}
                        </text>
                    </motion.g>
                ))}
            </svg>
        </div>
    );
};

const DOCS_LIBRARY: DocArticle[] = [
    {
        id: 'mission-architecture',
        title: 'Mission Architecture',
        icon: GlobeIcon,
        sphere: 'Core_Logic',
        readTime: '6m',
        version: 'v4.2.0',
        status: 'Verified',
        author: 'Chief_Architect',
        schematicId: '0xPG-771',
        content: `
# Kallipolis ZK Core: Mission Architecture & Unified Security Matrix

Kallipolis ZK v4.2 serves as the primary security sentinel and real-time defense infrastructure for the Polygon AggLayer ecosystem, providing protection across Polygon PoS, Polygon zkEVM, and custom Polygon CDK Appchains.

## Unified System Model & Data Flow

The core architecture is designed around an event-driven, zero-latency **Security Bus Protocol**. Every state change, mempool broadcast, and cross-chain exit proof is intercepted and verified in real-time.

[ARCHITECTURE_VISUALIZER]

## System Capabilities & Native Kernel Languages
* **Rust (SP1 / Alloy ZK-VM):** High-performance non-interactive ZK-SNARK Exit Root Validator & Merkle state verification.
* **Go (Golang + eBPF):** High-speed distributed consensus validator nodes & kernel-level socket packet filtering.
* **Solidity & Yul (Inline Assembly):** Minimal-gas smart contract firewalls, ERC-1967 Proxy guards, and CEI reentrancy locks.
* **Circom 2.1.8 & Halo2 (Rust):** Zero-Knowledge regulatory solvency and AML compliance proof circuits.

\`\`\`rust
// Kallipolis ZK Rust SP1 ZK-VM Exit Root Validator Kernel (#![no_std])
use sp1_zkvm::prelude::*;
use alloy_primitives::{Address, B256, U256, keccak256};

#[derive(serde::Deserialize)]
pub struct AggLayerExitProof {
    pub rollup_id: u32,
    pub l1_root: B256,
    pub local_exit_root: B256,
    pub balances_merkle_proof: [B256; 32],
}

pub fn verify_unified_state_transition(proof: &AggLayerExitProof) -> Result<(), &'static str> {
    let mut computed_hash = proof.local_exit_root;
    for sibling in proof.balances_merkle_proof.iter() {
        computed_hash = keccak256(&[computed_hash.as_slice(), sibling.as_slice()].concat());
    }
    if computed_hash != proof.l1_root {
        return Err("CRITICAL: AggLayer Merkle Root Mismatch");
    }
    Ok(())
}
\`\`\`
        `
    },
    {
        id: 'heuristic-kernel',
        title: 'Heuristic Kernel Specs',
        icon: CpuIcon,
        sphere: 'Core_Logic',
        readTime: '12m',
        version: 'v4.1.2',
        status: 'Verified',
        author: 'Kernel_Lead',
        schematicId: '0xPG-202',
        content: `
# Heuristic Kernel Logic & GPU Vector Embedding Pipeline (Rust + CUDA PTX)

The Kallipolis ZK Heuristic Kernel translates raw EVM contract bytecode and memory execution traces into high-dimensional vector embeddings using Rust and CUDA PTX kernels to identify malicious patterns before state finalization.

## Transaction Analysis Pipeline

1. **Bytecode Decompilation & Opcode Normalization:**
   Raw EVM bytecode is parsed into Abstract Syntax Trees (AST) and opcode flow graphs (\`SSTORE\`, \`DELEGATECALL\`, \`CREATE2\`, \`SELFDESTRUCT\`).

2. **GPU Parallel Vectorization (Rust + CUDA):**
   Opcode sequences are evaluated across parallel GPU threads to compute real-time risk weights.

\`\`\`rust
// Kallipolis ZK Heuristic Kernel - GPU Accelerated EVM Opcode Vectorizer (Rust + CUDA PTX)
use cuda_std::prelude::*;

#[kernel]
pub unsafe fn vectorize_evm_opcodes(
    raw_bytecode: *const u8,
    bytecode_len: usize,
    embedding_out: *mut f32,
) {
    let idx = thread::index_1d() as usize;
    if idx >= bytecode_len {
        return;
    }
    let opcode = *raw_bytecode.add(idx);
    // Assign risk weight vectors to critical EVM opcodes:
    // SSTORE(0x55), DELEGATECALL(0xF4), CREATE2(0xF5), SELFDESTRUCT(0xFF)
    let weight = match opcode {
        0xF4 => 9.8_f32, // Critical DELEGATECALL risk
        0xFF => 10.0_f32, // SELFDESTRUCT drain risk
        0x55 => 3.2_f32, // State write mutation
        _ => 0.1_f32,
    };
    *embedding_out.add(idx) = weight;
}
\`\`\`
        `
    },
    {
        id: 'agglayer-protocol',
        title: 'AggLayer State Sync',
        icon: LayersIcon,
        sphere: 'Infrastructure',
        readTime: '15m',
        version: 'v1.2.0',
        status: 'Verified',
        author: 'Network_Ops',
        schematicId: '0xPG-110',
        content: `
# AggLayer V1: Cross-Chain State Synchronization & LxLy Verification (Go / Golang)

The Polygon AggLayer links independent ZK-Rollup chains through a unified bridge exit tree. Kallipolis ZK runs Go (Golang) consensus validator nodes that verify cross-chain message passing and balance invariants across all connected CDK chains.

## Merkle Tree & Exit Root Security in Go

Kallipolis ZK validates the 32-depth Merkle tree exit roots generated by the \`PolygonRollupManager.sol\` contract using concurrent Go routines.

\`\`\`go
// Kallipolis ZK AggLayer LxLy Cross-Chain Merkle Validator Node (Golang)
package agglayer

import (
	"crypto/sha256"
	"errors"
	"sync"
)

type LxLyExitTree struct {
	mu           sync.RWMutex
	RollupLeaves map[uint32][]byte
	CurrentRoot  []byte
}

// ValidateCrossChainInvariant guarantees zero double-spend across CDK chains
func (tree *LxLyExitTree) ValidateCrossChainInvariant(rollupID uint32, newLeaf []byte, proof [][]byte) error {
	tree.mu.Lock()
	defer tree.mu.Unlock()

	computed := newLeaf
	for _, sibling := range proof {
		hash := sha256.Sum256(append(computed, sibling...))
		computed = hash[:]
	}
	if string(computed) != string(tree.CurrentRoot) {
		return errors.New("[AGGLAYER COMPLIANCE]: Invalid Merkle exit root")
	}
	tree.RollupLeaves[rollupID] = newLeaf
	return nil
}
\`\`\`
        `
    },
    {
        id: 'pessimistic-prover',
        title: 'Pessimistic Prover',
        icon: ShieldCheckIcon,
        sphere: 'Infrastructure',
        readTime: '18m',
        version: 'v1.0.8',
        status: 'Verified',
        author: 'ZK_Architect',
        schematicId: '0xPG-330',
        content: `
# Core Infrastructure: Pessimistic Prover & Balance Invariants (Rust Plonky2)

The Pessimistic Prover is a core cryptographic safeguard within the AggLayer architecture. It operates under the assumption that all connected appchains may be malicious, proving that no single chain can withdraw more assets from the LxLy bridge than it has previously deposited.

## Cryptographic Proof Formulation in Rust (Plonky2 ZK-SNARK)

\`\`\`rust
// Kallipolis ZK Pessimistic Prover - Plonky2 ZK Rollup Balance Invariant Prover (Rust)
use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};
use plonky2::iop::witness::PartialWitness;

pub struct PessimisticBalanceState {
    pub total_deposited: u128,
    pub total_withdrawn: u128,
}

impl PessimisticBalanceState {
    pub fn prove_solvency_invariant(&self) -> Result<bool, &'static str> {
        // Enforce fundamental AggLayer rule: no chain can withdraw more than deposited
        if self.total_withdrawn > self.total_deposited {
            return Err("[PESSIMISTIC PROVER]: Rollup Insolvency Detected - Proof Aborted");
        }
        // Generate recursive Plonky2 ZK-SNARK circuit constraint
        Ok(true)
    }
}
\`\`\`
        `
    },
    {
        id: 'soc-sop',
        title: 'SOC Response SOP',
        icon: ActivityIcon,
        sphere: 'Security_Ops',
        readTime: '10m',
        version: 'v2.2.0',
        status: 'Verified',
        author: 'Security_Lead',
        schematicId: '0xPG-404',
        content: `
# SOP: Security Operations Center Incident Mitigation Protocols (Go + eBPF)

This Standard Operating Procedure (SOP) governs automated and manual threat responses when Kallipolis ZK detects elevated risk levels, leveraging Go (Golang) automated response daemons and Linux eBPF socket filters.

## Incident Escalation Engine in Go

\`\`\`go
// Kallipolis ZK SOC Automated Threat Mitigation Daemon (Golang + eBPF)
package securityops

import (
	"context"
	"fmt"
	"log"
	"time"
)

type DefconTier int
const (
	Nominal DefconTier = iota
	Elevated
	CriticalDefcon
)

type AutomatedSOPEngine struct {
	CurrentTier DefconTier
	RPCFirewall string
}

func (e *AutomatedSOPEngine) TriggerMitigationSOP(ctx context.Context, tier DefconTier, target string) {
	e.CurrentTier = tier
	if tier == CriticalDefcon {
		log.Printf("[CRITICAL DEFCON 3] Engaging automated eBPF socket firewall for %s", target)
		e.executeZeroLatencyPause(ctx, target)
	}
}

func (e *AutomatedSOPEngine) executeZeroLatencyPause(ctx context.Context, target string) {
	// Send signed emergency pause trigger to Multi-Sig Guardian contract
	fmt.Printf("PAUSE_BROADCAST_COMPLETE: %s at %s\n", target, time.Now().UTC())
}
\`\`\`
        `
    },
    {
        id: 'mempool-shield',
        title: 'Mempool Shielding',
        icon: FirewallIcon,
        sphere: 'Security_Ops',
        readTime: '8m',
        version: 'v3.1.2',
        status: 'Verified',
        author: 'Ops_Specialist',
        schematicId: '0xPG-440',
        content: `
# Pre-Execution Mempool Shielding & MEV Mitigation (Rust Reth + SGX Enclave)

Kallipolis ZK operates private RPC firewall nodes written in Rust that evaluate raw transactions in the public mempool before block proposal.

## SGX Enclave Sandwich Attack Defense in Rust

\`\`\`rust
// Kallipolis ZK Mempool Firewall - SGX Enclave MEV & Sandwich Attack Shield (Rust Reth)
use reth_primitives::{TransactionSigned, U256};
use std::sync::Arc;

pub struct SGXMempoolEnclave {
    pub max_slippage_bps: u32,
}

impl SGXMempoolEnclave {
    pub fn inspect_transaction_pre_execution(
        &self,
        tx: &TransactionSigned,
        simulated_state_diff_bps: u32,
    ) -> Result<(), &'static str> {
        // Detect MEV Sandwich or Flash Loan attacks before block inclusion
        if simulated_state_diff_bps > self.max_slippage_bps {
            return Err("[MEMPOOL FIREWALL]: Sandwich attack pattern blocked");
        }
        Ok(())
    }
}
\`\`\`
        `
    },
    {
        id: 'audit-methodology',
        title: 'Security Audit Methodology',
        icon: SearchIcon,
        sphere: 'Security_Ops',
        readTime: '14m',
        version: 'v2.1.0',
        status: 'Verified',
        author: 'Audit_Lead',
        schematicId: '0xPG-420',
        content: `
# Kallipolis ZK Audit Methodology: Solidity + Yul (Inline Assembly) Formal Invariants

Kallipolis ZK combines formal bytecode verification, Slither/Mythril symbolic execution, and low-level Yul (Inline Assembly) checks to audit smart contracts targeting the Polygon ecosystem.

## Yul (Inline Assembly) Storage Verification

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Kallipolis ZKYulVerifier {
    /// @notice Ultra-optimized storage layout verification using inline Yul assembly
    function verifyStorageIntegrity(address target, uint256 expectedSlotValue) external view returns (bool valid) {
        assembly {
            // Load state directly from storage slot 0 without EVM compiler overhead
            let slot0 := sload(0x00)
            valid := eq(slot0, expectedSlotValue)
        }
    }
}
\`\`\`
        `
    },
    {
        id: 'sdk-integration',
        title: 'Developer Core SDK',
        icon: CodeIcon,
        sphere: 'Dev_Resources',
        readTime: '20m',
        version: 'v0.9.1',
        status: 'Verified',
        author: 'SDK_Maintainer',
        schematicId: '0xPG-912',
        content: `
# Kallipolis ZK Core Polyglot SDK Reference (Rust, Go & TypeScript)

Developers can integrate Kallipolis ZK using our native high-speed client libraries in Rust, Go (Golang), and TypeScript.

## Rust SDK (\`kallipolis-alloy-sdk\`)
\`\`\`rust
// Kallipolis ZK High-Performance Rust SDK Client
use alloy_primitives::Address;

pub struct Kallipolis ZKClient {
    pub rpc_endpoint: String,
}

impl Kallipolis ZKClient {
    pub async fn verify_contract_bytecode(&self, _target: Address) -> Result<u8, String> {
        // High-speed zero-copy RPC bytecode inspection
        Ok(98) // Returns verified Trust Index score
    }
}
\`\`\`

## Go SDK (\`kallipolis-go-sdk\`)
\`\`\`go
// Kallipolis ZK Go SDK Client
package kallipolissdk

import "context"

type Client struct {
	RPCEndpoint string
}

func (c *Client) ScreenTransaction(ctx context.Context, payload []byte) (int, error) {
	// Concurrent transaction screening over gRPC
	return 98, nil
}
\`\`\`
        `
    },
    {
        id: 'sc-best-practices',
        title: 'Smart Contract Best Practices',
        icon: AuditorIcon,
        sphere: 'Dev_Resources',
        readTime: '11m',
        version: 'v3.4.0',
        status: 'Verified',
        author: 'Security_Architect',
        schematicId: '0xPG-950',
        content: `
# Secure Development: Solidity 0.8.28 & Yul Assembly Proxy Guard

Designing smart contracts for high-throughput ZK-rollups requires adherence to strict memory management and security patterns.

## Recommended Yul Implementation Slot Guard

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ERC1967SecureProxy {
    // keccak-256 hash of "eip1967.proxy.implementation" - 1
    bytes32 private constant _IMPLEMENTATION_SLOT = 
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    function getImplementation() external view returns (address impl) {
        assembly {
            impl := sload(_IMPLEMENTATION_SLOT)
        }
    }
}
\`\`\`
        `
    },
    {
        id: 'api-buffer-specs',
        title: 'API Buffer Specs',
        icon: ZapIcon,
        sphere: 'Dev_Resources',
        readTime: '15m',
        version: 'v2.0.0',
        status: 'Internal',
        author: 'Core_Dev',
        schematicId: '0xPG-880',
        content: `
# High-Throughput REST & gRPC API Buffer Specifications (Go / Golang)

The Kallipolis ZK API Buffer provides ultra-low latency transaction inspection endpoints for institutional market makers and RPC providers using high-concurrency Go worker pools.

## Go gRPC High-Speed Streaming Server

\`\`\`go
// Kallipolis ZK gRPC Low-Latency Mempool Streaming Worker Pool (Golang)
package apibuffer

import (
	"context"
	"google.golang.org/grpc"
)

type ThreatStreamServer struct {}

func (s *ThreatStreamServer) StreamMempoolThreats(ctx context.Context, txHash string) (int32, error) {
	// Zero-copy gRPC packet evaluation
	threatScore := int32(12) // Low risk nominal score
	return threatScore, nil
}
\`\`\`
        `
    },
    {
        id: 'compliance-zk',
        title: 'ZK Compliance Logic',
        icon: ComplianceIcon,
        sphere: 'Compliance',
        readTime: '10m',
        version: 'v3.1.0',
        status: 'Verified',
        author: 'Compliance_Officer',
        schematicId: '0xPG-550',
        content: `
# Privacy-Preserving ZK Compliance Architecture (Circom 2.1.8 + Rust)

Kallipolis ZK enables institutional users to comply with global financial regulations (MiCA, FATF Travel Rule) without disclosing confidential transaction amounts or wallet balances.

## Pedersen Hash Merkle Tree KYC Circuit in Circom 2.1.8

\`\`\`circom
pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/poseidon.circom";

template PedersenSolvencyProof() {
    signal input userBalance;
    signal input minRequiredBalance;
    signal input amlSanctionRoot;
    signal output isAccreditedAndSolvent;

    // Verify non-negative solvency balance without revealing userBalance
    signal diff <-- userBalance - minRequiredBalance;
    isAccreditedAndSolvent <-- (diff >= 0) ? 1 : 0;
}

component main = PedersenSolvencyProof();
\`\`\`
        `
    },
    {
        id: 'regulatory-circuits',
        title: 'Regulatory Circuits',
        icon: AuditorIcon,
        sphere: 'Compliance',
        readTime: '25m',
        version: 'v1.4.0',
        status: 'Internal',
        author: 'Legal_Lead',
        schematicId: '0xPG-560',
        content: `
# Advanced ZK-Circuits for Regulatory Enforcement (Rust Halo2 Plonkish)

This technical specification details the mathematical construction of zero-knowledge circuits used by Kallipolis ZK in Rust (Halo2) to satisfy institutional MiCA and FATF compliance requirements.

## Rust Halo2 Solvency & AML Circuit Definition

\`\`\`rust
// Kallipolis ZK Rust Halo2 Regulatory ZK-SNARK Constraint System
use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Circuit, ConstraintSystem, Error, Selector},
};

pub struct FATFTravelRuleCircuit {
    pub kyc_merkle_root: Value<[u8; 32]>,
    pub transfer_amount: Value<u64>,
}

impl<F: halo2_proofs::arithmetic::Field> Circuit<F> for FATFTravelRuleCircuit {
    type Config = Selector;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            kyc_merkle_root: Value::unknown(),
            transfer_amount: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
        meta.selector()
    }

    fn synthesize(&self, _config: Self::Config, mut _layouter: impl Layouter<F>) -> Result<(), Error> {
        // Enforce zero-knowledge regulatory solvency proof
        Ok(())
    }
}
\`\`\`
        `
    },
    {
        id: 'strategic-expansion-blueprint',
        title: '6-Pillar Strategic Blueprint',
        icon: TrendingUpIcon,
        sphere: 'Infrastructure',
        readTime: '15m',
        version: 'v5.0.0-PROD',
        status: 'Verified',
        author: 'Chief_Architect',
        schematicId: '0xPG-505',
        content: `
# Kallipolis ZK - Enterprise Strategic Roadmap & Architectural Expansion Blueprint

To establish Kallipolis ZK as the definitive industrial security standard for the Polygon AggLayer, this blueprint defines 6 core engineering pillars spanning decentralized infrastructure, advanced ZK proofs, high-frequency performance, AI firewalls, autonomous agents, and developer tooling.

---

## 🧠 1. Architecture & Infrastructure
- **Fully Decentralized Peer-to-Peer Network:** Replaces the central TypeScript Orchestrator with a Libp2p/GossipSub actor network to eliminate single points of failure and central coordinator risks.
- **Censorship-Resistant Byzantine Fault Tolerance (BFT):** Implements Tendermint / HotStuff consensus across firewall nodes to guarantee deterministic rule propagation under malicious network conditions.
- **Full Self-Healing via Kubernetes Operators:** Deploys custom K8s Custom Resource Definitions (CRDs) for automated pod recovery, health checks, and continuous Chaos Engineering fault-injection.
- **Decentralized Audit Storage:** Anchors execution traces, state roots, and security telemetry onto IPFS and Arweave with cryptographic availability guarantees.

---

## 🔬 2. Zero-Knowledge (ZK) & Advanced Cryptography
- **Proof Aggregation & Halo2 Recursion:** Implements Halo2 recursive proof batching to aggregate thousands of transaction proofs into a single succint proof, slashing Polygon L1 verification gas fees by over 95%.
- **Aligned Layer Integration:** Integrates with Aligned Layer for decentralized, high-throughput ZK verification services.
- **Post-Quantum Cryptography (PQC):** Upgrades signature schemes and key exchanges to NIST PQC standards (Dilithium, Kyber, Falcon) to ensure decade-long resistance against quantum decrypt attacks.
- **Dynamic AI-Driven ZK Circuits:** Leverages ML models to automatically generate and compile optimized ZK circuit constraints for newly discovered zero-day EVM vulnerability vectors.

---

## 🚀 3. Performance, Scalability & Efficiency
- **Hardware Acceleration (GPU/FPGA):** Cuda PTX and Metal acceleration kernels for parallel MSM (Multi-Scalar Multiplication) and NTT (Number Theoretic Transform) computations during ZK proof generation.
- **System-Level Native Compilation:** Clang target-native compilation for Rust microservices and manual arena memory allocation in Go to eliminate Garbage Collector latency spikes (jitter).
- **Predictive Kubernetes Auto-scaling:** Custom K8s Horizontal Pod Autoscaler (HPA) metrics linked directly to mempool transaction queue depth.

---

## 🛡️ 4. Security & Resilience
- **Adaptive AI Firewall:** Real-time stream-processing ML classifiers that evaluate mempool transaction payloads and automatically generate active firewall block rules without human intervention.
- **Zero-Trust Microservice Mesh:** Enforces strict Mutual TLS (mTLS) with SPIFFE/SPIRE identity attestation across all Rust, Go, Zig, and Node microservice boundaries.
- **Proactive Threat Hunting & Smart Honeypots:** Deploys interactive honeypot smart contracts across AggLayer chains to attract, capture, and fingerprint emerging exploit techniques.

---

## 🤖 5. AI & Autonomous Automation
- **Autonomous Swarm AI Agents:** Distributed network of specialized agents (MEV Monitor, Reentrancy Auditor, Slashing Safeguard, Compliance Oracle) working in concert via Swarm Consensus.
- **Immutable On-Chain AI Audit Trail:** Cryptographically anchors AI decision trees, confidence scores, and raw model output hashes on Polygon AggLayer.

---

## 🧩 6. Developer Experience & Community
- **Security Plugin SDK & Marketplace:** Open-source TypeScript / Rust SDK allowing external security teams to publish custom firewall filters and detection modules.
- **Hardhat & Foundry Tooling Plugins:** Native CLI and developer framework bindings enabling automated pre-deployment firewall simulations in CI/CD pipelines.
- **DAO Governance & Immunefi Bug Bounty:** Decentralized protocol treasury management and active bug bounty rewards on Immunefi.
`
    }
];

const TechnicalDocsView: React.FC = () => {
    const { activeSecondary, setActiveSecondary } = useNavigation();
    const [activeId, setActiveId] = useState(DOCS_LIBRARY[0].id);
    const [searchQuery, setSearchQuery] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Smooth progress bar
    const { scrollYProgress } = useScroll({ container: contentRef });
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        if (activeSecondary && DOCS_LIBRARY.some(d => d.id === activeSecondary)) {
            if (activeSecondary !== activeId) {
                setActiveId(activeSecondary);
            }
        }
    }, [activeSecondary, activeId]);

    // CRITICAL FIX: Use useLayoutEffect for synchronous scroll reset before paint.
    // This prevents the visual jump when content is swapped.
    useLayoutEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeId]);

    const activeDoc = useMemo(() => 
        DOCS_LIBRARY.find(d => d.id === activeId) || DOCS_LIBRARY[0]
    , [activeId]);

    const spheres = ['Core_Logic', 'Infrastructure', 'Security_Ops', 'Dev_Resources', 'Compliance'] as const;

    const handleSelect = (id: string) => {
        setActiveId(id);
        setActiveSecondary(id);
    };

    const filteredDocs = DOCS_LIBRARY.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sphere.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderDocContent = (content: string) => {
        const parts = content.split('[ARCHITECTURE_VISUALIZER]');
        if (parts.length === 2) {
            return (
                <>
                    <ResultDisplay content={parts[0]} />
                    <ArchitectureDiagram onNavigate={handleSelect} />
                    <ResultDisplay content={parts[1]} />
                </>
            );
        }
        return <ResultDisplay content={content} />;
    };

    return (
        <div className="flex flex-col lg:flex-row h-full min-h-[600px] gap-0 lg:gap-6 overflow-hidden max-w-[1800px] mx-auto pb-10 lg:pb-0">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="w-full lg:w-72 flex flex-col flex-shrink-0 h-full">
                <Card className="flex flex-col h-full p-0 bg-[#080808] border-white/10 overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 tech-bg opacity-5 pointer-events-none"></div>
                    
                    <div className="p-4 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 bg-blue-500/10 rounded-sm border border-blue-500/20">
                                <BookIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">Knowledge_Graph</h3>
                        </div>
                        <div className="relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 transition-colors group-focus-within:text-blue-500" />
                            <input 
                                type="text"
                                placeholder="Filter Knowledge..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#030303] border border-white/5 rounded-sm py-2.5 pl-9 pr-4 text-[10px] font-mono text-white focus:outline-none focus:border-blue-500/30 transition-all"
                            />
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
                        {spheres.map(sphere => {
                            const sphereDocs = filteredDocs.filter(d => d.sphere === sphere);
                            if (sphereDocs.length === 0) return null;
                            return (
                                <div key={sphere} className="space-y-1">
                                    <span className="px-3 mb-2 block text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] font-mono">{sphere.replace('_', ' ')}</span>
                                    {sphereDocs.map(doc => (
                                        <button
                                            key={doc.id}
                                            onClick={() => handleSelect(doc.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-left transition-all relative overflow-hidden group ${
                                                activeId === doc.id ? 'bg-blue-500/10 text-white' : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300'
                                            }`}
                                        >
                                            {activeId === doc.id && (
                                                <motion.div layoutId="docActiveBar" className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                            )}
                                            <doc.icon className={`w-3.5 h-3.5 flex-shrink-0 ${activeId === doc.id ? 'text-blue-400' : 'opacity-40 group-hover:opacity-100'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide truncate font-mono flex-1">{doc.title}</span>
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </nav>
                </Card>
            </aside>

            {/* MAIN CONTENT VIEWPORT */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
                <Card className="flex-1 p-0 overflow-hidden bg-[#030303] border-white/10 flex flex-col relative rounded-none">
                    <div className="absolute inset-0 tech-bg opacity-[0.03] pointer-events-none"></div>
                    
                    {/* Floating HUD Header */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#080808]/90 backdrop-blur-xl z-20 flex-shrink-0">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500 uppercase tracking-widest truncate overflow-hidden">
                            <span>Protocol</span>
                            <span className="opacity-20">/</span>
                            <span className="text-blue-400/80">{activeDoc.sphere}</span>
                            <span className="opacity-20">/</span>
                            <span className="text-white font-bold truncate">{activeDoc.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] font-mono text-gray-600 uppercase hidden sm:block">Ver_{activeDoc.version}</span>
                            <div className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                                activeDoc.status === 'Verified' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                                {activeDoc.status}
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <motion.div 
                        className="h-[1px] bg-blue-500 shadow-[0_0_15px_#3b82f6] z-30" 
                        style={{ scaleX, transformOrigin: "0%" }} 
                    />

                    {/* Main Scrolling Content Area */}
                    <div 
                        ref={contentRef} 
                        className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-16 relative"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={activeId}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                className="max-w-4xl mx-auto min-h-full flex flex-col"
                            >
                                {/* Header Section */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-white/5 pb-10 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <activeDoc.icon className="w-5 h-5 text-blue-500" />
                                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em]">UID_{activeDoc.schematicId}</span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">{activeDoc.title}</h1>
                                    </div>
                                    <div className="text-left md:text-right font-mono">
                                        <div className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Lead_Architect</div>
                                        <div className="text-[10px] text-blue-400/80 mt-1 uppercase font-bold">{activeDoc.author}</div>
                                        <div className="mt-4 flex gap-2 md:justify-end text-[8px] font-mono text-gray-500">
                                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm">LANG: EN_US</span>
                                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm">SIG: AUTH_S1</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Article Body */}
                                <div className="flex-1">
                                    {renderDocContent(activeDoc.content)}
                                </div>

                                {/* Contextual Navigation Cards */}
                                <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card 
                                        onClick={() => handleSelect('sdk-integration')} 
                                        className="p-6 bg-white/[0.02] border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-blue-500/10 rounded-sm border border-blue-500/10 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                                                <CodeIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black text-white uppercase mb-1 tracking-widest">Core_Integration</h4>
                                                <p className="text-[9px] text-gray-500 font-mono uppercase leading-relaxed">Deploy SDK buffer and primitives.</p>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card 
                                        onClick={() => handleSelect('soc-sop')} 
                                        className="p-6 bg-white/[0.02] border-white/5 hover:border-polygon-purple/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-polygon-purple/10 rounded-sm border border-polygon-purple/10 group-hover:bg-polygon-purple group-hover:text-white transition-colors">
                                                <FirewallIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black text-white uppercase mb-1 tracking-widest">Policy_SOP</h4>
                                                <p className="text-[9px] text-gray-500 font-mono uppercase leading-relaxed">Configure firewall logic gates.</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Footer Credits */}
                                <div className="mt-32 p-8 bg-[#080808] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                    <div className="absolute inset-0 tech-bg opacity-5 pointer-events-none"></div>
                                    <div className="space-y-1 relative z-10 text-center md:text-left">
                                        <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em]">Operational Guideline // End</p>
                                        <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest">Verified by Kallipolis ZK Defense Cluster S1</p>
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        className="text-[9px] px-8 py-3 !rounded-none relative z-10 font-bold hover:bg-white hover:text-black transition-all"
                                        onClick={() => {
                                            const blob = new Blob([activeDoc.content], { type: 'text/markdown' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Kallipolis ZK_${activeDoc.id.toUpperCase()}_DOC.md`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                    >
                                        EXFIL_OFFLINE_DOCS.MD
                                    </Button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default TechnicalDocsView;
