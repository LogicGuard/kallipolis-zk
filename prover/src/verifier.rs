// prover/src/verifier.rs
use super::*;
use halo2_proofs::{
    plonk::{verify_proof, VerifyingKey},
    poly::{
        commitment::VerificationStrategy,
        ipa::{
            commitment::IPACommitmentScheme,
            multiopen::VerifierIPA,
            strategy::SingleStrategy,
        },
    },
    transcript::{Blake2bRead, Challenge255, TranscriptReadBuffer},
};
use pasta_curves::{Ep, pallas};
use anyhow::{anyhow, Result};

pub type PallasBase = pallas::Base;

/// Cryptographic verifier for PolyGuard Zero-Knowledge SNARKs. It operates within
/// our consensus and bridge validation loops to check incoming execution proofs
/// before transactions are certified.
pub struct VerifierEngine {
    /// Reference to the centralized SRS parameters
    proof_system: Arc<ProofSystem>,
}

impl VerifierEngine {
    /// Initializes the Verifier Engine with a shared reference to the Proof System.
    pub fn new(proof_system: Arc<ProofSystem>) -> Self {
        Self { proof_system }
    }

    /// Verifies a single proof against a registered circuit, verifying keys, and public inputs.
    /// Returns `Ok(true)` if the proof is valid, `Ok(false)` if invalid, or `Err` if there are
    /// setup or serialization failures.
    pub fn verify(
        &self,
        circuit_name: &str,
        proof_bytes: &[u8],
        public_inputs: &[PallasBase],
    ) -> Result<bool> {
        let vk = self.proof_system.get_verifying_key(circuit_name)
            .ok_or_else(|| anyhow!("Circuit '{}' must be registered in ProofSystem before verifying proofs", circuit_name))?;

        let mut transcript = Blake2bRead::<_, _, Challenge255<_>>::init(proof_bytes);
        
        let strategy = SingleStrategy::new(&self.proof_system.params);
        let public_inputs_slice: &[&[PallasBase]] = &[public_inputs];

        let result = verify_proof::<IPACommitmentScheme<Ep>, VerifierIPA<Ep>, _, _, _>(
            &self.proof_system.params,
            vk,
            strategy,
            &[public_inputs_slice],
            &mut transcript,
        );

        match result {
            Ok(_) => {
                tracing::info!("Proof verified successfully for circuit: '{}'", circuit_name);
                Ok(true)
            }
            Err(e) => {
                tracing::warn!("Proof verification FAILED for circuit '{}': {:?}", circuit_name, e);
                Ok(false)
            }
        }
    }

    /// Helper to verify multiple batched proofs in parallel.
    /// This improves performance when processing a block of transactions.
    pub fn verify_batch(
        &self,
        proofs: &[(&str, &[u8], &[PallasBase])],
    ) -> Result<Vec<bool>> {
        let mut results = Vec::with_capacity(proofs.len());
        
        for (name, bytes, inputs) in proofs {
            match self.verify(name, bytes, inputs) {
                Ok(status) => results.push(status),
                Err(e) => {
                    tracing::error!("Error encountered during batch item verification: {:?}", e);
                    results.push(false);
                }
            }
        }

        Ok(results)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use polyguard_halo2_circuits::mempool_circuit::MempoolCircuit;
    use halo2_proofs::circuit::Value;
    use pasta_curves::Fp;

    #[test]
    fn test_verification_lifecycle_success() {
        let mut proof_system = ProofSystem::new(8).unwrap();
        
        // Mock honest compliant transaction
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(777u64)),
            Value::known(Fp::from(101u64)),
            Value::known(Fp::from(202u64)),
            Value::known(Fp::from(50_000_000u64)),
            Value::known(Fp::ZERO),
            Value::known(Fp::ZERO),
        );

        proof_system.register_circuit("MempoolFirewall", &circuit).unwrap();
        let proof_system_arc = Arc::new(proof_system);
        
        let public_inputs = vec![Fp::from(777u64)];
        
        // Generate proof
        let proof = proof_system_arc.generate_proof("MempoolFirewall", &circuit, &public_inputs).unwrap();
        
        // Initialize Verifier
        let verifier = VerifierEngine::new(proof_system_arc);
        
        // Verify proof
        let is_valid = verifier.verify("MempoolFirewall", &proof, &public_inputs).unwrap();
        assert!(is_valid, "Verifier should confirm honest proof is mathematically valid");
    }

    #[test]
    fn test_verification_fails_with_modified_public_inputs() {
        let mut proof_system = ProofSystem::new(8).unwrap();
        
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(777u64)),
            Value::known(Fp::from(101u64)),
            Value::known(Fp::from(202u64)),
            Value::known(Fp::from(50_000_000u64)),
            Value::known(Fp::ZERO),
            Value::known(Fp::ZERO),
        );

        proof_system.register_circuit("MempoolFirewall", &circuit).unwrap();
        let proof_system_arc = Arc::new(proof_system);
        
        let public_inputs_correct = vec![Fp::from(777u64)];
        let public_inputs_forged = vec![Fp::from(999u64)]; // modified public tx_hash
        
        let proof = proof_system_arc.generate_proof("MempoolFirewall", &circuit, &public_inputs_correct).unwrap();
        
        let verifier = VerifierEngine::new(proof_system_arc);
        
        // Verify with forged inputs
        let is_valid = verifier.verify("MempoolFirewall", &proof, &public_inputs_forged).unwrap();
        assert!(!is_valid, "Verifier should reject proof if public inputs were tampered with");
    }
}
