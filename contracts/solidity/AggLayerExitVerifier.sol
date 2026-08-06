// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PolyGuard AggLayer LxLy Exit Root Bridge Verifier
/// @notice Verifies 32-depth Merkle exit proofs with Yul inline assembly for minimal EVM gas footprint
/// @author PolyGuard Security Kernel (Solidity + Yul)
contract AggLayerExitVerifier {
    bytes32 public immutable l1MerkleRoot;
    mapping(bytes32 => bool) public nullifierSpent;

    event ExitProofVerified(uint32 indexed rollupId, bytes32 indexed leafHash, address recipient, uint256 amount);
    event NullifierFlagged(bytes32 indexed nullifier, uint256 timestamp);

    error DoubleSpendAttempted(bytes32 nullifier);
    error InvalidMerkleRoot(bytes32 computed, bytes32 expected);

    constructor(bytes32 _initialRoot) {
        l1MerkleRoot = _initialRoot;
    }

    /// @notice Verifies LxLy exit proof using Yul inline assembly Keccak256 loop
    function verifyExitProof(
        uint32 rollupId,
        bytes32 leafHash,
        bytes32[] calldata merkleProof,
        address recipient,
        uint256 amount
    ) external returns (bool valid) {
        bytes32 nullifier = keccak256(abi.encodePacked(rollupId, leafHash));
        if (nullifierSpent[nullifier]) {
            revert DoubleSpendAttempted(nullifier);
        }

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

        if (computedHash != l1MerkleRoot) {
            revert InvalidMerkleRoot(computedHash, l1MerkleRoot);
        }

        nullifierSpent[nullifier] = true;
        emit ExitProofVerified(rollupId, leafHash, recipient, amount);
        return true;
    }
}
