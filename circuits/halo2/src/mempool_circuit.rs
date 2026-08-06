// circuits/halo2/src/mempool_circuit.rs
use super::*;
use ff::PrimeField;
use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Advice, Column, ConstraintSystem, Error, Instance, Selector, Expression},
    poly::Rotation,
};
use pasta_curves::pallas;

/// Config for the Mempool Firewall Circuit
#[derive(Clone, Debug)]
pub struct MempoolCircuitConfig {
    pub advice: [Column<Advice>; 5],
    pub instance: Column<Instance>,
    pub s_malicious: Selector,
    pub s_gas_check: Selector,
    pub s_range: Selector,
}

/// A circuit validating that a mempool transaction is compliant with
/// local firewall rules (e.g., verifying gas price bounds for high-risk flags,
/// validating correct risk scores, and enforcing security invariants).
#[derive(Clone, Debug, Default)]
pub struct MempoolCircuit<F: PrimeField> {
    pub tx_hash: Value<F>,
    pub from_address: Value<F>,
    pub to_address: Value<F>,
    pub gas_price: Value<F>,
    pub is_malicious: Value<F>,
    pub risk_score: Value<F>,
}

impl<F: PrimeField> MempoolCircuit<F> {
    pub fn new(
        tx_hash: Value<F>,
        from: Value<F>,
        to: Value<F>,
        gas_price: Value<F>,
        is_malicious: Value<F>,
        risk_score: Value<F>,
    ) -> Self {
        Self {
            tx_hash,
            from_address: from,
            to_address: to,
            gas_price,
            is_malicious,
            risk_score,
        }
    }
}

impl<F: PrimeField> Circuit<F> for MempoolCircuit<F> {
    type Config = MempoolCircuitConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            tx_hash: Value::unknown(),
            from_address: Value::unknown(),
            to_address: Value::unknown(),
            gas_price: Value::unknown(),
            is_malicious: Value::unknown(),
            risk_score: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
        let advice = [
            meta.advice_column(),
            meta.advice_column(),
            meta.advice_column(),
            meta.advice_column(),
            meta.advice_column(),
        ];
        let instance = meta.instance_column();

        let s_malicious = meta.selector();
        let s_gas_check = meta.selector();
        let s_range = meta.selector();

        meta.enable_equality(instance);
        for col in advice.iter() {
            meta.enable_equality(*col);
        }

        // Gate 1: Malicious Risk Check
        // Enforce that if `is_malicious` is active (i.e. equals 1), the computed risk score
        // must match the preset high-threat flag (e.g. at least 50 points).
        // Constraint: s_malicious * is_malicious * (50 - risk_score) == 0
        meta.create_gate("risk score threshold", |meta| {
            let s = meta.query_selector(s_malicious);
            let is_mal_val = meta.query_advice(advice[3], Rotation::cur());
            let risk_score_val = meta.query_advice(advice[4], Rotation::cur());
            
            let fifty = Expression::Constant(F::from(50u64));
            vec![s * is_mal_val * (fifty - risk_score_val)]
        });

        // Gate 2: Gas Price Minimum Bound for Malicious Flags
        // Suspicious or high-risk transaction items must pay a gas penalty or pass strict thresholds.
        // Constraint: s_gas_check * is_malicious * (gas_price - threshold) == 0 (with threshold = 1 Gwei)
        meta.create_gate("gas price penalty enforcement", |meta| {
            let s = meta.query_selector(s_gas_check);
            let is_mal_val = meta.query_advice(advice[3], Rotation::cur());
            let gas_val = meta.query_advice(advice[2], Rotation::cur());
            
            // Gas price threshold = 1 Gwei (1,000,000,000 Wei)
            let threshold = Expression::Constant(F::from(1_000_000_000u64));
            vec![s * is_mal_val * (gas_val - threshold)]
        });

        // Gate 3: Boolean Range Check on 'is_malicious'
        // Invariant: is_malicious * (1 - is_malicious) == 0
        meta.create_gate("boolean check", |meta| {
            let s = meta.query_selector(s_range);
            let is_mal_val = meta.query_advice(advice[3], Rotation::cur());
            let one = Expression::Constant(F::ONE);
            
            vec![s * is_mal_val.clone() * (one - is_mal_val)]
        });

        MempoolCircuitConfig {
            advice,
            instance,
            s_malicious,
            s_gas_check,
            s_range,
        }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<F>,
    ) -> Result<(), Error> {
        layouter.assign_region(
            || "Mempool Firewall Synthesis",
            |mut region| {
                // Enable our Plonkish custom gates
                config.s_malicious.enable(&mut region, 0)?;
                config.s_gas_check.enable(&mut region, 0)?;
                config.s_range.enable(&mut region, 0)?;

                // 1. Assign tx_hash
                region.assign_advice(
                    || "tx_hash witness",
                    config.advice[0],
                    0,
                    || self.tx_hash,
                )?;

                // 2. Assign from_address
                region.assign_advice(
                    || "from_address witness",
                    config.advice[1],
                    0,
                    || self.from_address,
                )?;

                // 3. Assign gas_price
                region.assign_advice(
                    || "gas_price witness",
                    config.advice[2],
                    0,
                    || self.gas_price,
                )?;

                // 4. Assign is_malicious
                region.assign_advice(
                    || "is_malicious flag witness",
                    config.advice[3],
                    0,
                    || self.is_malicious,
                )?;

                // 5. Assign risk_score
                region.assign_advice(
                    || "risk_score witness",
                    config.advice[4],
                    0,
                    || self.risk_score,
                )?;

                Ok(())
            },
        )?;

        // Connect tx_hash to public input instances
        layouter.assign_region(
            || "Public Input Mapping",
            |mut region| {
                region.assign_advice(
                    || "public input tx_hash connection",
                    config.advice[0],
                    0,
                    || self.tx_hash,
                )?;
                Ok(())
            },
        )?;

        Ok(())
    }
}

impl<F: PrimeField> PolyGuardCircuit<F> for MempoolCircuit<F> {
    fn name(&self) -> &'static str {
        "Mempool Firewall Compliance Circuit"
    }

    fn instance_count(&self) -> usize {
        1
    }

    fn public_inputs(&self) -> Vec<Vec<F>> {
        let val = match self.tx_hash {
            Value::Known(x) => x,
            _ => F::ZERO,
        };
        vec![vec![val]]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use halo2_proofs::dev::MockProver;
    use pasta_curves::Fp;

    #[test]
    fn test_mempool_circuit_honest_tx() {
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(1001u64)),
            Value::known(Fp::from(2001u64)),
            Value::known(Fp::from(3001u64)),
            Value::known(Fp::from(50_000_000u64)), // honest, low gas
            Value::known(Fp::ZERO),                 // not malicious
            Value::known(Fp::ZERO),                 // no risk
        );

        let public_inputs = vec![vec![Fp::from(1001u64)]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        assert_eq!(prover.verify(), Ok(()));
    }

    #[test]
    fn test_mempool_circuit_malicious_compliant_gas() {
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(1002u64)),
            Value::known(Fp::from(2001u64)),
            Value::known(Fp::from(3001u64)),
            Value::known(Fp::from(1_000_000_000u64)), // malicious, paying high gas penalty
            Value::known(Fp::ONE),                  // is_malicious = 1
            Value::known(Fp::from(50u64)),            // risk score = 50
        );

        let public_inputs = vec![vec![Fp::from(1002u64)]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        assert_eq!(prover.verify(), Ok(()));
    }

    #[test]
    fn test_mempool_circuit_malicious_violates_gas() {
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(1003u64)),
            Value::known(Fp::from(2001u64)),
            Value::known(Fp::from(3001u64)),
            Value::known(Fp::from(500_000_000u64)), // too low for malicious
            Value::known(Fp::ONE),                  // is_malicious = 1
            Value::known(Fp::from(50u64)),            // risk score = 50
        );

        let public_inputs = vec![vec![Fp::from(1003u64)]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        // Should fail due to Gate 2: is_malicious * (gas_price - threshold) != 0
        assert!(prover.verify().is_err());
    }

    #[test]
    fn test_mempool_circuit_malicious_violates_score() {
        let circuit = MempoolCircuit::<Fp>::new(
            Value::known(Fp::from(1004u64)),
            Value::known(Fp::from(2001u64)),
            Value::known(Fp::from(3001u64)),
            Value::known(Fp::from(1_000_000_000u64)),
            Value::known(Fp::ONE),                  // is_malicious = 1
            Value::known(Fp::from(49u64)),            // risk score != 50
        );

        let public_inputs = vec![vec![Fp::from(1004u64)]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        // Should fail due to Gate 1: is_malicious * (50 - risk_score) != 0
        assert!(prover.verify().is_err());
    }
}
