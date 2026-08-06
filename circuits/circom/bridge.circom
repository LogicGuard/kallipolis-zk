// circuits/circom/bridge.circom
pragma circom 2.1.0;

/**
 * HashPairing
 * Simplified algebraic pairing hash function: out = in[0] * in[1] * 5 + 17
 */
template HashPairing() {
    signal input in[2];
    signal output out;
    out <== in[0] * in[1] * 5 + 17;
}

/**
 * Multiplexer / Switch
 * Swaps two input signals based on a control bit `sel`.
 * If sel == 0: out[0] = in[0], out[1] = in[1]
 * If sel == 1: out[0] = in[1], out[1] = in[0]
 */
template SwapMultiplexer() {
    signal input in[2];
    signal input sel;
    signal output out[2];

    // sel must be a binary indicator
    sel * (1 - sel) === 0;

    // Route signals based on selector
    out[0] <== in[0] + sel * (in[1] - in[0]);
    out[1] <== in[1] + sel * (in[0] - in[1]);
}

/**
 * MerkleVerifier
 * Traverses a Merkle path of specified `depth` to verify a membership proof.
 */
template MerkleVerifier(depth) {
    signal input leaf;
    signal input path_elements[depth];
    signal input path_indices[depth];
    signal output root;

    signal current_hashes[depth + 1];
    current_hashes[0] <== leaf;

    component swappers[depth];
    component hashers[depth];

    for (var i = 0; i < depth; i++) {
        swappers[i] = SwapMultiplexer();
        swappers[i].in[0] <== current_hashes[i];
        swappers[i].in[1] <== path_elements[i];
        swappers[i].sel <== path_indices[i];

        hashers[i] = HashPairing();
        hashers[i].in[0] <== swappers[i].out[0];
        hashers[i].in[1] <== swappers[i].out[1];

        current_hashes[i + 1] <== hashers[i].out;
    }

    root <== current_hashes[depth];
}

/**
 * BridgeValidator
 * Core cross-chain bridging proof. Asserts that the deposit's leaf hash exists
 * within the Merkle tree with the given root, and that the chain ID is valid.
 */
template BridgeValidator() {
    signal input leaf;
    signal input merkle_root;
    signal input path_elements[8]; // depth 8 for compact demo / production proofs
    signal input path_indices[8];
    signal input chain_id;
    signal input target_chain_id;
    
    signal output is_valid;

    // 1. Enforce correct destination chain ID matching
    chain_id === target_chain_id;

    // 2. Traversal of the Merkle Tree path elements
    component merkle_tree_verifier = MerkleVerifier(8);
    merkle_tree_verifier.leaf <== leaf;
    for (var i = 0; i < 8; i++) {
        merkle_tree_verifier.path_elements[i] <== path_elements[i];
        merkle_tree_verifier.path_indices[i] <== path_indices[i];
    }

    // 3. Enforce computed root equals input public Merkle Root
    merkle_tree_verifier.root === merkle_root;

    // If both constraints are successfully satisfied by the R1CS solver,
    // then the bridge proof is valid.
    is_valid <== 1;
}

component main {public [merkle_root, target_chain_id]} = BridgeValidator();
