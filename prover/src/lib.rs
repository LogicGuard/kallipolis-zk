// prover/src/lib.rs
pub mod verifier;

use halo2_proofs::{
    circuit::Circuit,
    plonk::{create_proof, keygen_pk, keygen_vk, ProvingKey, VerifyingKey},
    poly::{
        commitment::{Params, ParamsProver},
        ipa::{
            commitment::{IPACommitmentScheme, ParamsIPA},
            multiopen::ProverIPA,
            strategy::SingleStrategy,
        },
        VerificationStrategy,
    },
    transcript::{Blake2bWrite, Challenge255, TranscriptWriterBuffer},
};
use pasta_curves::{pallas, Ep, Eq};
use rand::rngs::OsRng;
use std::collections::HashMap;
use std::sync::Arc;
use anyhow::{Context, Result};
use tracing::{info, warn, error};

pub type PallasBase = pallas::Base;
pub type PallasScalar = pallas::Scalar;

/// Represents a configured proof generation system. It maintains the global setup parameters
/// (e.g. structured reference string) and caches pre-compiled proving and verification keys
/// to optimize multi-transaction processing cycles.
pub struct ProofSystem {
    /// Degree of polynomial limit (k). Usually between 8 and 18 depending on gate complexity.
    pub k: u32,
    /// Universal proving parameter set (Lagrange SRS)
    pub params: ParamsIPA<Ep>,
    /// Proving keys cache mapped by circuit unique identifier names
    proving_keys: HashMap<String, ProvingKey<Ep>>,
    /// Verifying keys cache mapped by circuit unique identifier names
    verifying_keys: HashMap<String, VerifyingKey<Ep>>,
}

impl ProofSystem {
    /// Initializes a new Proof System with degree `k` parameters.
    pub fn new(k: u32) -> Result<Self> {
        info!("Initializing PolyGuard Proof System with polynomial degree k = {}", k);
        let params = ParamsIPA::<Ep>::new(k);
        
        Ok(Self {
            k,
            params,
            proving_keys: HashMap::new(),
            verifying_keys: HashMap::new(),
        })
    }

    /// Compiles a circuit structure to extract and register its Verification Key (VK)
    /// and Proving Key (PK). This allows reusing compiled assets for rapid proof cycles.
    pub fn register_circuit<C>(&mut self, circuit_name: &str, circuit: &C) -> Result<()>
    where
        C: Circuit<PallasBase>,
    {
        info!("Registering and compiling keypairs for circuit: '{}'", circuit_name);
        
        let vk = keygen_vk(&self.params, circuit)
            .map_err(|e| anyhow::anyhow!("Failed compiling Verification Key (VK) for {}: {:?}", circuit_name, e))?;
            
        let pk = keygen_pk(&self.params, vk.clone(), circuit)
            .map_err(|e| anyhow::anyhow!("Failed compiling Proving Key (PK) for {}: {:?}", circuit_name, e))?;

        self.verifying_keys.insert(circuit_name.to_string(), vk);
        self.proving_keys.insert(circuit_name.to_string(), pk);
        
        info!("Successfully registered and compiled keypairs for '{}'", circuit_name);
        Ok(())
    }

    /// Generates a zero-knowledge Plonk proof for a registered circuit.
    /// Returns the raw proof bytes that can be transmitted over the wire or saved to an audit store.
    pub fn generate_proof<C>(
        &self,
        circuit_name: &str,
        circuit: &C,
        public_inputs: &[PallasBase],
    ) -> Result<Vec<u8>>
    where
        C: Circuit<PallasBase>,
    {
        let pk = self.proving_keys.get(circuit_name)
            .with_context(|| format!("Proving key not found for registered circuit: '{}'", circuit_name))?;

        let mut transcript = Blake2bWrite::<_, _, Challenge255<_>>::init(vec![]);
        
        let public_inputs_slice: &[&[PallasBase]] = &[public_inputs];

        create_proof::<IPACommitmentScheme<Ep>, ProverIPA<Ep>, _, _, _, _>(
            &self.params,
            pk,
            &[circuit.clone()],
            &[public_inputs_slice],
            OsRng,
            &mut transcript,
        )
        .map_err(|e| anyhow::anyhow!("Failed creating ZK-Proof for {}: {:?}", circuit_name, e))?;

        let proof_bytes = transcript.finalize();
        info!("Generated {} bytes ZK-Proof for circuit '{}'", proof_bytes.len(), circuit_name);
        
        Ok(proof_bytes)
    }

    /// Retrieves a compiled verification key (VK) from the internal cache.
    pub fn get_verifying_key(&self, circuit_name: &str) -> Option<&VerifyingKey<Ep>> {
        self.verifying_keys.get(circuit_name)
    }

    /// Generates a detailed verification record representing audit-trail metadata
    pub fn create_audit_trail(
        &self,
        circuit_name: &str,
        proof_size: usize,
        success: bool,
    ) -> serde_json::Value {
        serde_json::json!({
            "circuit": circuit_name,
            "proof_system": "Plonkish IPA",
            "k_degree": self.k,
            "proof_size_bytes": proof_size,
            "verification_status": if success { "VERIFIED" } else { "FAILED" },
            "timestamp": chrono::Utc::now().to_rfc3339(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use polyguard_halo2_circuits::mempool_circuit::MempoolCircuit;
    use halo2_proofs::circuit::Value;
    use pasta_curves::Fp;

    #[test]
    fn test_prover_system_lifecycle() {
        let mut proof_system = ProofSystem::new(8).unwrap();
        
        // Mock a valid mempool firewall transaction
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(5005u64)),
            Value::known(Fp::from(2001u64)),
            Value::known(Fp::from(3001u64)),
            Value::known(Fp::from(100_000_000u64)),
            Value::known(Fp::ZERO),
            Value::known(Fp::ZERO),
        );

        proof_system.register_circuit("MempoolFirewall", &circuit).unwrap();
        
        let public_inputs = vec![Fp::from(5005u64)];
        
        // Generate proof
        let proof = proof_system.generate_proof("MempoolFirewall", &circuit, &public_inputs);
        assert!(proof.is_ok(), "Proof generation should succeed. Got: {:?}", proof.err());
        
        let proof_bytes = proof.unwrap();
        assert!(!proof_bytes.is_empty(), "Generated proof bytes must not be empty");
    }
}
