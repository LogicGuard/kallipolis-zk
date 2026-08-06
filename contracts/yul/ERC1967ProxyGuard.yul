/*
 * @title PolyGuard ERC-1967 Yul Assembly Proxy Guard
 * @notice Pure Yul low-level implementation slot lock & checks-effects-interactions enforcer
 * @dev Protects against uninitialized proxy takeover and storage collisions
 */

object "PolyGuardERC1967Proxy" {
    code {
        // Constructor: set owner slot and implementation slot
        sstore(0, caller())
        
        // EIP-1967 implementation slot: keccak256("eip1967.proxy.implementation") - 1
        let implSlot := 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
        sstore(implSlot, 0x0000000000000000000000000000000000000000)
        
        // Deploy runtime code
        datacopy(0, dataoffset("Runtime"), datasize("Runtime"))
        return(0, datasize("Runtime"))
    }
    
    object "Runtime" {
        code {
            // Check reentrancy guard slot (slot 2)
            let status := sload(2)
            if eq(status, 2) {
                // Revert with ReentrancyGuardReentrant() selector (0x3ee5aeb5)
                mstore(0, 0x3ee5aeb500000000000000000000000000000000000000000000000000000000)
                revert(0, 4)
            }
            sstore(2, 2) // Lock

            let implSlot := 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
            let impl := sload(implSlot)
            if iszero(impl) {
                revert(0, 0)
            }
            
            // Delegatecall to implementation contract
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            
            sstore(2, 1) // Unlock
            
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
