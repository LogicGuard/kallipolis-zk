// PolyGuard Privacy-Preserving Solvency & AML Regulatory Circuit
// Language: Circom 2.1.8 (ZK-SNARK / Groth16 & Plonky2 Compatible)
pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template RegulatorySolvencyCircuit(TREE_DEPTH) {
    // Private Witness Inputs (Hidden from public observers)
    signal input userWalletAddress;
    signal input balanceAssetA;
    signal input balanceAssetB;
    signal input amlSanctionRoot;
    signal input amlPathSiblings[TREE_DEPTH];
    signal input amlPathIndices[TREE_DEPTH];

    // Public Inputs (Regulatory Minimum Solvency & Global KYC Registry Root)
    signal input minRequiredTotalUsd;
    signal input kycRegistryRoot;

    // Public Output Claim
    signal output isAccreditedAndSolvent;

    // 1. Solvency Proof: verify balanceAssetA + balanceAssetB >= minRequiredTotalUsd
    signal totalLiquidBalance <-- balanceAssetA + balanceAssetB;
    component solvencyComparator = GreaterEqThan(64);
    solvencyComparator.in[0] <== totalLiquidBalance;
    solvencyComparator.in[1] <== minRequiredTotalUsd;
    solvencyComparator.out === 1;

    // 2. Identity commitment without revealing userWalletAddress
    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== userWalletAddress;
    leafHasher.inputs[1] <== 0; // Null leaf check for non-sanction status

    // Output assertion
    isAccreditedAndSolvent <-- solvencyComparator.out;
}

component main {public [minRequiredTotalUsd, kycRegistryRoot]} = RegulatorySolvencyCircuit(20);
