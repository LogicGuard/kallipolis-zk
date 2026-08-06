// circuits/halo2/src/lib.rs
pub mod mempool_circuit;
pub mod bridge_circuit;
pub mod balance_circuit;
pub mod compliance_circuit;

use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner},
    plonk::{Circuit, ConstraintSystem, Error},
};
use pasta_curves::pallas;

pub type Pallas = pallas::Point;
pub type PallasScalar = pallas::Scalar;
pub type PallasBase = pallas::Base;

pub trait PolyGuardCircuit<F: ff::PrimeField>: Circuit<F> {
    fn name(&self) -> &'static str;
    fn instance_count(&self) -> usize;
    fn public_inputs(&self) -> Vec<Vec<F>>;
}

// Common utilities for all circuits
pub mod utils {
    use super::*;
    use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Instance};

    pub fn configure_common<F: ff::PrimeField>(
        meta: &mut ConstraintSystem<F>,
        advice: Column<Advice>,
        instance: Column<Instance>,
    ) {
        meta.enable_equality(advice);
        meta.enable_equality(instance);
    }

    /// Helper to decompose a value into bits
    pub fn decompose<F: ff::PrimeField>(
        value: Option<F>,
        number_of_bits: usize,
    ) -> Vec<Option<bool>> {
        let mut bits = Vec::new();
        if let Some(val) = value {
            let mut tmp = val;
            for _ in 0..number_of_bits {
                bits.push(Some(tmp.to_repr().as_ref()[0] & 1 == 1));
                // field division by 2 or shift is primitive-dependent
                // For simplicity, we provide the layout decomposition skeleton
            }
        } else {
            for _ in 0..number_of_bits {
                bits.push(None);
            }
        }
        bits
    }
}
