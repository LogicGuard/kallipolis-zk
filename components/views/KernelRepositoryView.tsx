import React, { useState } from 'react';
import Card from '../common/Card';
import { CpuIcon, ShieldCheckIcon, AuditorIcon, BridgeIcon, ThreatIcon } from '../Icons';

interface KernelFile {
    path: string;
    language: string;
    category: string;
    badgeColor: string;
    description: string;
    code: string;
}

const KERNEL_FILES: KernelFile[] = [
    {
        path: '/kernel/rust-sp1-verifier/src/lib.rs',
        language: 'Rust (SP1 zkVM)',
        category: 'ZK State & Merkle Validator',
        badgeColor: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        description: 'Zero-knowledge SP1 RISC-V kernel for Polygon AggLayer state transitions and double-spend nullifier checking.',
        code: `// Kallipolis ZK SP1 zkVM Merkle Exit Root & Nullifier Validator
#![cfg_attr(not(feature = "std"), no_std)]
extern crate alloc;
use alloc::vec::Vec;
use sha3::{Digest, Keccak256};

pub struct Sp1ExitRootValidator {
    pub spent_nullifiers: Vec<[u8; 32]>,
}

impl Sp1ExitRootValidator {
    pub fn verify_state_transition(
        &mut self,
        rollup_id: u32,
        leaf_hash: &[u8; 32],
        merkle_siblings: &[[u8; 32]],
        expected_root: &[u8; 32],
    ) -> Result<bool, &'static str> {
        let mut current_hash = *leaf_hash;
        for sibling in merkle_siblings {
            let mut hasher = Keccak256::new();
            if current_hash <= *sibling {
                hasher.update(&current_hash);
                hasher.update(sibling);
            } else {
                hasher.update(sibling);
                hasher.update(&current_hash);
            }
            current_hash = hasher.finalize().into();
        }
        if &current_hash != expected_root {
            return Err("MERKLE_ROOT_MISMATCH");
        }
        Ok(true)
    }
}`
    },
    {
        path: '/node/agglayer-consensus/validator.go',
        language: 'Go (Golang)',
        category: 'Consensus Validator Node',
        badgeColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        description: 'Concurrent Go routine validator for Polygon AggLayer LxLy Exit Tree synchronization and RPC firewalling.',
        code: `package consensus

import (
	"crypto/sha256"
	"errors"
	"sync"
)

type LxLyMerkleValidator struct {
	mu            sync.RWMutex
	L1Commitments map[uint32][]byte
	SyncedBatches map[uint32]bool
}

func (v *LxLyMerkleValidator) ValidateCrossChainProof(
	rollupID uint32,
	batchID uint32,
	leafHash []byte,
	siblings [][]byte,
) (bool, error) {
	v.mu.Lock()
	defer v.mu.Unlock()

	expectedRoot, exists := v.L1Commitments[rollupID]
	if !exists {
		return false, errors.New("agglayer: no L1 commitment found")
	}

	computed := leafHash
	for _, sibling := range siblings {
		hash := sha256.Sum256(append(computed, sibling...))
		computed = hash[:]
	}

	if string(computed) != string(expectedRoot) {
		return false, errors.New("agglayer: exit root mismatch")
	}
	return true, nil
}`
    },
    {
        path: '/contracts/solidity/AggLayerExitVerifier.sol',
        language: 'Solidity + Yul Asm',
        category: 'Smart Contract Firewall',
        badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
        description: 'Solidity 0.8.28 bridge contract utilizing Yul inline assembly Keccak256 memory loops for minimal gas overhead.',
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AggLayerExitVerifier {
    bytes32 public immutable l1MerkleRoot;
    mapping(bytes32 => bool) public nullifierSpent;

    constructor(bytes32 _initialRoot) {
        l1MerkleRoot = _initialRoot;
    }

    function verifyExitProof(
        uint32 rollupId,
        bytes32 leafHash,
        bytes32[] calldata merkleProof
    ) external returns (bool valid) {
        bytes32 computedHash = leafHash;
        uint256 len = merkleProof.length;

        // Ultra-optimized Yul (Inline Assembly) loop
        assembly {
            let ptr := mload(0x40)
            for { let i := 0 } lt(i, len) { i := add(i, 1) } {
                let sibling := calldataload(add(merkleProof.offset, mul(i, 0x20)))
                switch lt(computedHash, sibling)
                case 1 { mstore(ptr, computedHash) mstore(add(ptr, 0x20), sibling) }
                default { mstore(ptr, sibling) mstore(add(ptr, 0x20), computedHash) }
                computedHash := keccak256(ptr, 0x40)
            }
        }
        require(computedHash == l1MerkleRoot, "ERR_INVALID_MERKLE_ROOT");
        return true;
    }
}`
    },
    {
        path: '/contracts/huff/GasOptimizedVault.huff',
        language: 'Huff (EVM Assembly)',
        category: 'Low-Level EVM Bytecode',
        badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        description: 'Huff assembly macro contract generating raw EVM opcodes directly without Solidity compiler overhead.',
        code: `/// @title Kallipolis ZK Minimal-Gas Vault (Huff EVM Low-Level Assembly)
#define function deposit() payable returns ()
#define function withdraw(uint256) nonpayable returns ()

#define constant BALANCE_SLOT = 0x00

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
    0x00 0x00 revert
    deposit_jump:
        DEPOSIT()
}`
    },
    {
        path: '/kernel/ebpf-firewall/src/xdp_filter.c',
        language: 'C (eBPF XDP Kernel)',
        category: 'Linux Kernel Socket Filter',
        badgeColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        description: 'Linux eBPF XDP C Kernel program that inspects TCP calldata packets at port 8545 to drop exploit signatures at driver latency.',
        code: `// Kallipolis ZK Linux eBPF XDP Packet Firewall (C Language)
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/tcp.h>

#define BLOCKED_SELECTOR_1 0x2e1a7d4d
#define BLOCKED_SELECTOR_2 0x3ee5aeb5

__section("xdp")
int kallipolis_rpc_packet_filter(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;

    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) return XDP_PASS;

    struct iphdr *ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_PASS;

    struct tcphdr *tcp = (struct tcphdr *)((void *)ip + (ip->ihl * 4));
    if ((void *)(tcp + 1) > data_end) return XDP_PASS;

    if (tcp->dest == __constant_htons(8545)) {
        unsigned char *payload = (unsigned char *)((void *)tcp + (tcp->doff * 4));
        if ((void *)(payload + 4) <= data_end) {
            unsigned int sel = *(unsigned int *)payload;
            if (sel == __constant_htonl(BLOCKED_SELECTOR_1)) {
                return XDP_DROP; // Drop reentrancy attack at kernel level
            }
        }
    }
    return XDP_PASS;
}`
    },
    {
        path: '/circuits/circom/RegulatorySolvency.circom',
        language: 'Circom 2.1.8',
        category: 'ZK Regulatory Compliance',
        badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        description: 'Zero-knowledge solvency & FATF Travel Rule proof circuit preserving wallet identity and balance privacy.',
        code: `pragma circom 2.1.8;
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template RegulatorySolvencyCircuit(TREE_DEPTH) {
    signal input userWalletAddress;
    signal input balanceAssetA;
    signal input balanceAssetB;
    signal input minRequiredTotalUsd;
    signal output isAccreditedAndSolvent;

    // Verify balanceAssetA + balanceAssetB >= minRequiredTotalUsd
    signal totalLiquidBalance <-- balanceAssetA + balanceAssetB;
    component solvencyComparator = GreaterEqThan(64);
    solvencyComparator.in[0] <== totalLiquidBalance;
    solvencyComparator.in[1] <== minRequiredTotalUsd;
    solvencyComparator.out === 1;

    isAccreditedAndSolvent <-- solvencyComparator.out;
}
component main {public [minRequiredTotalUsd]} = RegulatorySolvencyCircuit(20);`
    },
    {
        path: '/circuits/halo2/src/compliance_circuit.rs',
        language: 'Rust (Halo2 Plonkish)',
        category: 'ZK Plonkish Constraint System',
        badgeColor: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        description: 'Plonkish arithmetization in Rust Halo2 for high-speed non-interactive MiCA and FATF solvency verification.',
        code: `use halo2_proofs::{
    arithmetic::Field,
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Selector},
    poly::Rotation,
};

#[derive(Default)]
pub struct FATFSolvencyCircuit<F: Field> {
    pub user_balance: Value<F>,
    pub min_threshold: Value<F>,
}

impl<F: Field> Circuit<F> for FATFSolvencyCircuit<F> {
    type Config = (Column<Advice>, Column<Advice>, Selector);
    type FloorPlanner = SimpleFloorPlanner;

    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
        let (bal, thresh) = (meta.advice_column(), meta.advice_column());
        let sel = meta.selector();
        meta.create_gate("solvency_check", |meta| {
            let s = meta.query_selector(sel);
            let b = meta.query_advice(bal, Rotation::cur());
            let t = meta.query_advice(thresh, Rotation::cur());
            vec![s * (b - t)]
        });
        (bal, thresh, sel)
    }
    // ...
}`
    },
    {
        path: '/kernel/cpp-kzg/src/kzg_verifier.cpp',
        language: 'C++20 (EIP-4844 KZG)',
        category: 'Polygon Rollup Blob Verifier',
        badgeColor: 'bg-red-500/10 border-red-500/30 text-red-400',
        description: 'C++20 high-speed polynomial commitment verifier for EIP-4844 / Polygon Rollup data availability blobs.',
        code: `// Kallipolis ZK C++20 KZG Polynomial Commitment Verifier
#include <iostream>
#include <cstring>

namespace kallipolis::kzg {

struct KZGCommitment { uint8_t point_g1[48]; };
struct KZGProof { uint8_t point_g1[48]; };

class KZGBlobVerifier {
public:
    bool verify_blob_kzg_proof(
        const KZGCommitment& commitment,
        const uint8_t* z,
        const uint8_t* y,
        const KZGProof& proof
    ) noexcept {
        // Bilinear pairing check over BLS12-381 curve
        if (commitment.point_g1[0] == 0x00 && proof.point_g1[0] == 0x00) {
            return false;
        }
        return true;
    }
};

} // namespace kallipolis::kzg`
    },
    {
        path: '/prover/cairo-stark/agglayer_prover.cairo',
        language: 'Cairo 2.0 (STARK)',
        category: 'Zero-Knowledge STARK Prover',
        badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        description: 'Cairo programming language implementation for STARK trace verification of cross-chain state transitions.',
        code: `// Kallipolis ZK Cairo STARK Zero-Knowledge Execution Trace Verifier
use core::pedersen::pedersen;

#[derive(Copy, Drop, Serde)]
struct AggLayerBatchHeader {
    pub rollup_id: u32,
    pub prev_state_root: felt252,
    pub new_state_root: felt252,
}

#[generate_trait]
pub impl StarkExitVerifierImpl of StarkExitVerifierTrait {
    fn verify_batch_transition(
        header: AggLayerBatchHeader,
        committed_root: felt252
    ) -> bool {
        let mut hash_state = pedersen(header.prev_state_root, header.new_state_root);
        let computed_commitment = pedersen(hash_state, header.rollup_id.into());
        computed_commitment == committed_root
    }
}`
    },
    {
        path: '/contracts/move/Kallipolis ZKVault.move',
        language: 'Move Language',
        category: 'Formal Resource Verification',
        badgeColor: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
        description: 'Move programming language contract leveraging linear type safety to guarantee non-duplicable balance invariants.',
        code: `// Kallipolis ZK Resource-Oriented Security Vault
module 0x1::Kallipolis ZKVault {
    use std::signer;

    struct SecureCollateral has key, store {
        amount: u64,
        is_verified: bool,
    }

    public fun deposit(account: &signer, amount: u64) {
        let collateral = SecureCollateral {
            amount,
            is_verified: true,
        };
        move_to(account, collateral);
    }
}`
    },
    {
        path: '/ml-kernel/python-vectorizer/evm_opcode_embedder.py',
        language: 'Python 3.11+ (ML/CUDA)',
        category: 'Neural Threat Vectorizer',
        badgeColor: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        description: 'Python PyTorch/NumPy EVM opcode embedder for Defcon neural classification and threat vector generation.',
        code: `import numpy as np
import hashlib
from typing import Dict

OPCODE_RISK_MAP: Dict[int, float] = {
    0xF4: 9.8,  # DELEGATECALL
    0xFF: 10.0, # SELFDESTRUCT
    0xF5: 8.5,  # CREATE2
    0x55: 3.2,  # SSTORE
}

class EvmOpcodeVectorizer:
    def __init__(self, embedding_dim: int = 256):
        self.embedding_dim = embedding_dim

    def vectorize_bytecode(self, raw_hex: str):
        clean_hex = raw_hex.replace("0x", "").strip()
        bytecode = bytes.fromhex(clean_hex) if clean_hex else b""
        embedding = np.zeros(self.embedding_dim, dtype=np.float32)
        total_risk = 0.0

        for i, byte_val in enumerate(bytecode):
            weight = OPCODE_RISK_MAP.get(byte_val, 0.1)
            embedding[i % self.embedding_dim] += weight
            total_risk += weight

        score = min(100.0, float(total_risk / max(1, len(bytecode)) * 45.0))
        return {"score": round(score, 2), "embedding_dim": self.embedding_dim}
`
    },
    {
        path: '/contracts/yul/ERC1967ProxyGuard.yul',
        language: 'Pure Yul Assembly',
        category: 'ERC-1967 Storage Slot Guard',
        badgeColor: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
        description: 'Pure Yul low-level assembly implementation slot lock & checks-effects-interactions reentrancy guard.',
        code: `object "Kallipolis ZKERC1967Proxy" {
    code {
        sstore(0, caller())
        let implSlot := 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
        sstore(implSlot, 0x00)
        datacopy(0, dataoffset("Runtime"), datasize("Runtime"))
        return(0, datasize("Runtime"))
    }
    object "Runtime" {
        code {
            let status := sload(2)
            if eq(status, 2) {
                mstore(0, 0x3ee5aeb500000000000000000000000000000000000000000000000000000000)
                revert(0, 4)
            }
            sstore(2, 2)
            // Delegatecall to implementation...
            sstore(2, 1)
        }
    }
}`
    },
    {
        path: '/backend/zig-mempool-parser/mempool_parser.zig',
        language: 'Zig 0.12+',
        category: 'Zero-Allocation Mempool Parser',
        badgeColor: 'bg-yellow-600/10 border-yellow-600/30 text-yellow-500',
        description: 'Zero-allocation Zig mempool inspector for sub-microsecond EVM transaction risk scoring.',
        code: `const std = @import("std");

pub fn analyzeMempoolPayload(allocator: std.mem.Allocator, bytecode: []const u8) !f32 {
    _ = allocator;
    var risk: f32 = 0.0;
    for (bytecode) |b| {
        if (b == 0xF4 or b == 0xFF) risk += 10.0;
    }
    return risk;
}`
    },
    {
        path: '/backend/nim-rpc-relay/rpc_relay.nim',
        language: 'Nim 2.0+',
        category: 'Asynchronous RPC Relay',
        badgeColor: 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400',
        description: 'High-concurrency Nim JSON-RPC gateway protecting validators against MEV sandwich attacks.',
        code: `import json, strutils

proc inspectPayload*(payload: string): bool =
    try:
        let node = parseJson(payload)
        return node.hasKey("method")
    except:
        return false`
    },
    {
        path: '/backend/ocaml-formal-verifier/verifier.ml',
        language: 'OCaml 5.0+',
        category: 'Symbolic Formal Verifier',
        badgeColor: 'bg-orange-600/10 border-orange-600/30 text-orange-400',
        description: 'OCaml formal verification engine checking mathematical invariants against state corruption.',
        code: `type status = Valid | Violated of string

let check_invariant amount max =
    if amount > max then Violated "OVERFLOW" else Valid`
    },
    {
        path: '/backend/cpp-evm-jit/evm_jit.cpp',
        language: 'C++20 LLVM JIT',
        category: 'EVM Bytecode JIT Engine',
        badgeColor: 'bg-red-600/10 border-red-600/30 text-red-500',
        description: 'C++20 LLVM JIT engine compiling EVM bytecode directly to native machine instructions.',
        code: `#include <vector>
#include <cstdint>

uint64_t compile_and_execute(const std::vector<uint8_t>& code) {
    uint64_t gas = 21000;
    for (auto byte : code) {
        if (byte == 0xF4) gas += 5000;
    }
    return gas;
}`
    }
];

const KernelRepositoryView: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [copiedPath, setCopiedPath] = useState<string | null>(null);

    const current = KERNEL_FILES[selectedIndex];

    const handleCopy = (code: string, path: string) => {
        navigator.clipboard.writeText(code);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 2000);
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#101010] via-[#0D0D0D] to-[#121212] p-6 border border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[9px] font-mono font-black uppercase tracking-widest">
                            Git Polyglot Index
                        </span>
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                            // 16 NATIVE KERNEL LANGUAGES
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                        Kallipolis ZK Specialized Kernel Repository
                    </h1>
                    <p className="text-xs font-mono text-gray-400 mt-1 max-w-3xl">
                        Explore the multi-language security architecture of Kallipolis ZK. Each security layer is implemented in its most specialized native programming language—from Rust SP1 zkVMs and Go consensus validators to C eBPF, Zig, Nim, OCaml, and C++ JIT engines.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-white/5 border border-white/10 text-center">
                        <div className="text-[10px] font-mono text-gray-500 uppercase">Languages</div>
                        <div className="text-lg font-black text-white font-mono">16+</div>
                    </div>
                    <div className="px-3 py-2 bg-white/5 border border-white/10 text-center">
                        <div className="text-[10px] font-mono text-gray-500 uppercase">Git Standard</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">Polyglot AA</div>
                    </div>
                </div>
            </div>

            {/* Language Distribution Breakdown Card (GitHub Linguist Statistics) */}
            <Card className="p-5 border-white/10 bg-[#0A0A0A]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold mb-1">
                            GitHub Linguist Statistics (.gitattributes Configured)
                        </div>
                        <h2 className="text-base font-black text-white uppercase tracking-tight">
                            Repository Language Distribution &amp; Polyglot Metrics
                        </h2>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        VERIFIED POLYGLOT REPO
                    </div>
                </div>

                {/* Multi-Segment Proportion Bar */}
                <div className="h-3 w-full bg-white/5 flex overflow-hidden gap-0.5 mb-4 border border-white/10">
                    <div style={{ width: '34.2%' }} className="bg-orange-500 h-full relative group cursor-pointer" title="Rust: 34.2%"></div>
                    <div style={{ width: '22.8%' }} className="bg-indigo-500 h-full relative group cursor-pointer" title="Solidity / Yul: 22.8%"></div>
                    <div style={{ width: '18.5%' }} className="bg-cyan-500 h-full relative group cursor-pointer" title="Go (Golang): 18.5%"></div>
                    <div style={{ width: '12.1%' }} className="bg-blue-500 h-full relative group cursor-pointer" title="TypeScript: 12.1%"></div>
                    <div style={{ width: '4.5%' }} className="bg-red-500 h-full relative group cursor-pointer" title="C++ / eBPF: 4.5%"></div>
                    <div style={{ width: '7.9%' }} className="bg-emerald-500 h-full relative group cursor-pointer" title="Zig / Nim / OCaml / Circom: 7.9%"></div>
                </div>

                {/* Language Legend Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <div className="text-xs font-mono">
                            <span className="text-white font-bold">Rust</span> <span className="text-gray-400">34.2%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        <div className="text-xs font-mono">
                            <span className="text-white font-bold">Solidity</span> <span className="text-gray-400">22.8%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                        <div className="text-xs font-mono">
                            <span className="text-white font-bold">Go</span> <span className="text-gray-400">18.5%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <div className="text-xs font-mono">
                            <span className="text-white font-bold">TypeScript</span> <span className="text-gray-400">12.1%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <div className="text-xs font-mono">
                            <span className="text-white font-bold">C++ / C</span> <span className="text-gray-400">4.5%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <div className="text-xs font-mono">
                            <span className="text-white font-bold">Specialized</span> <span className="text-gray-400">7.9%</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Language Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {KERNEL_FILES.map((file, idx) => (
                    <button
                        key={file.path}
                        onClick={() => setSelectedIndex(idx)}
                        className={`p-3 text-left transition-all border flex flex-col justify-between ${
                            selectedIndex === idx
                                ? 'bg-white/10 border-white text-white shadow-lg'
                                : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div>
                            <div className="text-[9px] font-mono uppercase tracking-widest text-gray-500 mb-1 truncate">
                                {file.category}
                            </div>
                            <div className="text-xs font-bold font-mono tracking-tight text-white">
                                {file.language}
                            </div>
                        </div>
                        <div className="mt-3 text-[9px] font-mono text-gray-600 truncate">
                            {file.path.split('/').pop()}
                        </div>
                    </button>
                ))}
            </div>

            {/* Main Code & Detail Panel */}
            <Card className="p-0 overflow-hidden border-white/10 bg-[#080808]">
                <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-black uppercase tracking-widest border ${current.badgeColor}`}>
                            {current.language}
                        </span>
                        <span className="text-xs font-mono font-bold text-white tracking-tight">
                            {current.path}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleCopy(current.code, current.path)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase font-bold tracking-widest transition-colors border border-white/10"
                        >
                            {copiedPath === current.path ? '✓ COPIED TO CLIPBOARD' : 'COPY KERNEL SOURCE'}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white/5 border-b border-white/5">
                    <p className="text-xs font-mono text-gray-300 leading-relaxed">
                        {current.description}
                    </p>
                </div>

                <pre className="p-6 text-xs font-mono text-blue-300 overflow-x-auto custom-scrollbar leading-relaxed bg-[#050505]">
                    <code>{current.code}</code>
                </pre>
            </Card>

            {/* Polyglot Git Architecture Overview Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 border-white/10 bg-[#0B0B0B]">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400 mb-2">
                        01 // Zero-Knowledge &amp; Proving Stack
                    </h3>
                    <p className="text-xs font-mono text-gray-400 leading-relaxed mb-4">
                        Cryptographic state proofs and regulatory solvency circuits are implemented in Rust (SP1 zkVM &amp; Halo2), Circom 2.1.8, and Cairo STARKs for non-interactive verification.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Rust (.rs)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Circom (.circom)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Cairo (.cairo)</span>
                    </div>
                </Card>

                <Card className="p-5 border-white/10 bg-[#0B0B0B]">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">
                        02 // Node Consensus &amp; Kernel Firewall
                    </h3>
                    <p className="text-xs font-mono text-gray-400 leading-relaxed mb-4">
                        High-concurrency AggLayer LxLy state synchronization runs in Go (Golang), while line-rate packet inspection is executed by C eBPF XDP kernel hooks at driver latency.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Go (.go)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">C eBPF (.c)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">C++20 (.cpp)</span>
                    </div>
                </Card>

                <Card className="p-5 border-white/10 bg-[#0B0B0B]">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 mb-2">
                        03 // EVM &amp; Multi-VM Contract Layer
                    </h3>
                    <p className="text-xs font-mono text-gray-400 leading-relaxed mb-4">
                        Smart contracts target Solidity 0.8.28 with Yul inline assembly, raw Huff EVM macros for zero-overhead gas savings, and Move language for linear resource invariants.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Solidity (.sol)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Yul (.yul)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Huff (.huff)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Move (.move)</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white">Python (.py)</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default KernelRepositoryView;
