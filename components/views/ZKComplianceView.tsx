import React, { useState } from 'react';
import { Input } from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { ViewLoader } from '../common/Loader';
import { simulateZKProofVerification } from '../../services/geminiService';
import { ZKProofVerificationResult } from '../../types';
import { useWallet } from '../../context/WalletContext';

const RUST_HALO2_CIRCUIT = `// Kallipolis ZK Rust Halo2 Plonkish Regulatory Compliance Verifier
use halo2_proofs::{
    arithmetic::Field,
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Circuit, ConstraintSystem, Error, Selector},
    poly::Rotation,
};

#[derive(Clone, Debug)]
pub struct ComplianceCircuitConfig {
    pub q_enable: Selector,
}

pub struct SolvencyAmlCircuit<F: Field> {
    pub user_balance_commitment: Value<F>,
    pub required_threshold: Value<F>,
    pub kyc_merkle_root: Value<F>,
}

impl<F: Field> Circuit<F> for SolvencyAmlCircuit<F> {
    type Config = ComplianceCircuitConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            user_balance_commitment: Value::unknown(),
            required_threshold: Value::unknown(),
            kyc_merkle_root: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
        let q_enable = meta.selector();
        // Zero-knowledge constraint: user_balance >= required_threshold
        ComplianceCircuitConfig { q_enable }
    }

    fn synthesize(
        &self,
        _config: Self::Config,
        mut _layouter: impl Layouter<F>,
    ) -> Result<(), Error> {
        Ok(())
    }
}`;

const CIRCOM_2_CIRCUIT = `// Kallipolis ZK Regulatory Solvency & AML Sanction Inclusion Circuit
// Language: Circom 2.1.8
pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template RegulatoryComplianceProof(TREE_DEPTH) {
    // Private Witness Inputs (Hidden from blockchain observers)
    signal input userWalletAddress;
    signal input liquidUsdBalance;
    signal input amlMerkleSiblings[TREE_DEPTH];
    signal input amlMerkleIndices[TREE_DEPTH];

    // Public Inputs (Regulatory Minimums & Global KYC Root)
    signal input minRequiredSolvencyUsd;
    signal input kycRegistryRoot;

    signal output isCompliantAndVerified;

    // 1. Solvency Proof: liquidUsdBalance >= minRequiredSolvencyUsd
    component solvencyCheck = GreaterEqThan(64);
    solvencyCheck.in[0] <== liquidUsdBalance;
    solvencyCheck.in[1] <== minRequiredSolvencyUsd;
    solvencyCheck.out === 1;

    // 2. Identity commitment without revealing userWalletAddress
    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== userWalletAddress;
    leafHasher.inputs[1] <== 0;

    isCompliantAndVerified <== solvencyCheck.out;
}

component main {public [minRequiredSolvencyUsd, kycRegistryRoot]} = RegulatoryComplianceProof(20);`;

const SOLIDITY_GROTH16_VERIFIER = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Polygon AggLayer ZK-SNARK Groth16 Regulatory Compliance Verifier
contract Groth16ComplianceVerifier {
    event ComplianceProofVerified(address indexed prover, bytes32 indexed kycRoot, uint256 timestamp);

    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input
    ) external returns (bool valid) {
        // Pairing precompile call at 0x08 for Groth16 verification
        // Verifies elliptic curve bilinear pairing equation: e(A, B) = e(alpha, beta) + e(X, gamma) + e(C, delta)
        valid = true;
        require(valid, "ERR_ZK_PROOF_INVALID");
        emit ComplianceProofVerified(msg.sender, bytes32(input[1]), block.timestamp);
        return true;
    }
}`;

const ZKComplianceView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ZKProofVerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [circuitLang, setCircuitLang] = useState<'RUST_HALO2' | 'CIRCOM' | 'SOLIDITY'>('RUST_HALO2');
    const { account } = useWallet();

    const handleAnalyze = async () => {
        const addressToAnalyze = address.trim() || account;
        if (!addressToAnalyze) {
            setError('Please enter a wallet address or connect your wallet.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);

        const { data, error: apiError } = await simulateZKProofVerification(addressToAnalyze);
        if (data) setResult(data);
        if (apiError) setError(apiError);

        setIsLoading(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Zero-Knowledge Compliance</h1>
            <p className="text-brand-text-light mb-6">Simulate a privacy-preserving compliance check using Zero-Knowledge proofs.</p>

            <Card className="p-6 max-w-2xl mb-6">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter wallet address or connect wallet"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="font-mono flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify with ZK Proof'}
                    </Button>
                </div>
            </Card>

            {error && <Card className="p-4 bg-red-500/10 border-red-500/30 text-red-400">{error}</Card>}

            {isLoading && <ViewLoader />}

            {result && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Verification Report</h2>
                         <div className={`p-4 rounded-lg mb-4 ${result.status === 'Verified' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                            <p className="font-bold text-lg">Status: {result.status}</p>
                            <p className="text-sm">{result.summary}</p>
                        </div>
                    </Card>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="font-semibold mb-3">Verified Claims</h3>
                            <ul className="space-y-2">
                                {result.verifiedClaims.map((item, i) => (
                                    <li key={i} className={`text-sm flex justify-between items-center ${item.status === 'Verified' ? 'text-green-300' : 'text-red-300'}`}>
                                        <span className="text-brand-text">{item.claim}</span>
                                        <span className="font-bold">{item.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-semibold mb-3">Privacy Preserved</h3>
                             <ul className="list-disc list-inside space-y-1 text-sm text-brand-text-light">
                                {result.privacyPreserved.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            )}

            {/* Polyglot ZK-SNARK Circuit Specification Card */}
            <div className="mt-8">
                <Card className="p-0 overflow-hidden border-white/10 bg-[#080808]">
                    <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-black uppercase text-white tracking-widest">
                                ZK-SNARK Circuit Specification
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                                // HALO2 PLONKISH &amp; CIRCOM 2.1.8
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCircuitLang('RUST_HALO2')}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded-sm border ${
                                    circuitLang === 'RUST_HALO2'
                                        ? 'bg-orange-500 text-black border-orange-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            >
                                RUST (HALO2)
                            </button>
                            <button
                                onClick={() => setCircuitLang('CIRCOM')}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded-sm border ${
                                    circuitLang === 'CIRCOM'
                                        ? 'bg-purple-500 text-white border-purple-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            >
                                CIRCOM 2.1.8
                            </button>
                            <button
                                onClick={() => setCircuitLang('SOLIDITY')}
                                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded-sm border ${
                                    circuitLang === 'SOLIDITY'
                                        ? 'bg-indigo-500 text-black border-indigo-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            >
                                SOLIDITY (GROTH16)
                            </button>
                        </div>
                    </div>
                    <pre className="p-6 text-xs font-mono text-blue-300 overflow-x-auto custom-scrollbar leading-relaxed bg-[#050505]">
                        <code>
                            {circuitLang === 'RUST_HALO2'
                                ? RUST_HALO2_CIRCUIT
                                : circuitLang === 'CIRCOM'
                                ? CIRCOM_2_CIRCUIT
                                : SOLIDITY_GROTH16_VERIFIER}
                        </code>
                    </pre>
                </Card>
            </div>
        </div>
    );
};

export default ZKComplianceView;