#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;
use alloc::vec::Vec;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct AggLayerExitProof {
    pub rollup_id: u32,
    pub leaf_hash: [u8; 32],
    pub merkle_siblings: Vec<[u8; 32]>,
    pub expected_l1_root: [u8; 32],
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum VerifierError {
    MerkleRootMismatch,
    InvalidProofLength,
    NullifierAlreadySpent,
}

pub struct Sp1ExitRootValidator {
    spent_nullifiers: Vec<[u8; 32]>,
}

impl Sp1ExitRootValidator {
    pub fn new() -> Self {
        Self {
            spent_nullifiers: Vec::new(),
        }
    }

    pub fn compute_nullifier(&self, rollup_id: u32, leaf_hash: &[u8; 32]) -> [u8; 32] {
        let mut hasher = Keccak256::new();
        hasher.update(&rollup_id.to_be_bytes());
        hasher.update(leaf_hash);
        hasher.finalize().into()
    }

    pub fn verify_state_transition(
        &mut self,
        proof: &AggLayerExitProof,
    ) -> Result<bool, VerifierError> {
        if proof.merkle_siblings.is_empty() || proof.merkle_siblings.len() > 32 {
            return Err(VerifierError::InvalidProofLength);
        }

        let nullifier = self.compute_nullifier(proof.rollup_id, &proof.leaf_hash);
        if self.spent_nullifiers.contains(&nullifier) {
            return Err(VerifierError::NullifierAlreadySpent);
        }

        let mut current_hash = proof.leaf_hash;
        for sibling in &proof.merkle_siblings {
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

        if current_hash != proof.expected_l1_root {
            return Err(VerifierError::MerkleRootMismatch);
        }

        self.spent_nullifiers.push(nullifier);
        Ok(true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validator_init() {
        let validator = Sp1ExitRootValidator::new();
        assert!(validator.spent_nullifiers.is_empty());
    }
}
