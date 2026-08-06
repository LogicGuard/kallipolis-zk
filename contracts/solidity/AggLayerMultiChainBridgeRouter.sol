// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PolyGuard Enterprise AggLayer LxLy Multi-Chain Bridge Router
/// @notice Handles cross-rollup asset transfers and cryptographic exit proofs with Yul inline assembly
contract AggLayerMultiChainBridgeRouter {
    address public immutable governor;
    mapping(uint32 => bytes32) public chainExitRoots;
    mapping(bytes32 => bool) public executedNullifiers;

    event CrossChainTransferExecuted(uint32 indexed sourceChain, uint32 indexed destChain, address recipient, uint256 amount);
    event ExitRootUpdated(uint32 indexed chainId, bytes32 newRoot);

    error Unauthorized();
    error DoubleSpend();
    error InvalidProof();

    constructor(address _governor) {
        governor = _governor;
    }

    modifier onlyGovernor() {
        if (msg.sender != governor) revert Unauthorized();
        _;
    }

    function updateExitRoot(uint32 chainId, bytes32 newRoot) external onlyGovernor {
        chainExitRoots[chainId] = newRoot;
        emit ExitRootUpdated(chainId, newRoot);
    }

    function verifyAndExecute(
        uint32 sourceChain,
        uint32 destChain,
        bytes32 leafHash,
        bytes32[] calldata merkleProof,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        bytes32 nullifier = keccak256(abi.encodePacked(sourceChain, destChain, leafHash, recipient, amount));
        if (executedNullifiers[nullifier]) revert DoubleSpend();

        bytes32 root = chainExitRoots[sourceChain];
        bytes32 computed = leafHash;
        uint256 len = merkleProof.length;

        assembly {
            let ptr := mload(0x40)
            for { let i := 0 } lt(i, len) { i := add(i, 1) } {
                let sibling := calldataload(add(merkleProof.offset, mul(i, 0x20)))
                switch lt(computed, sibling)
                case 1 {
                    mstore(ptr, computed)
                    mstore(add(ptr, 0x20), sibling)
                }
                default {
                    mstore(ptr, sibling)
                    mstore(add(ptr, 0x20), computed)
                }
                computed := keccak256(ptr, 0x40)
            }
        }

        if (computed != root) revert InvalidProof();

        executedNullifiers[nullifier] = true;
        emit CrossChainTransferExecuted(sourceChain, destChain, recipient, amount);
        return true;
    }
}
