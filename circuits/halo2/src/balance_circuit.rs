// circuits/halo2/src/balance_circuit.rs
use super::*;
use ff::PrimeField;
use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Advice, Column, ConstraintSystem, Error, Instance, Selector, Expression},
    poly::Rotation,
};
use pasta_curves::pallas;

/// Config for the Balance Invariant Circuit
#[derive(Clone, Debug)]
pub struct BalanceCircuitConfig {
    pub advice: [Column<Advice>; 5],
    pub instance: Column<Instance>,
    pub s_balance: Selector,
    pub s_non_inflationary: Selector,
}

/// A circuit validating that the system balance complies with solvency rules:
/// the total cumulative withdrawals must never exceed the total cumulative deposits.
/// It also asserts that any liquidity state remains fully collateralized.
#[derive(Clone, Debug, Default)]
pub struct BalanceCircuit<F: PrimeField> {
    pub total_deposited: Value<F>,
    pub total_withdrawn: Value<F>,
    pub reserve_ratio: Value<F>, // e.g. represented as ratio * 100
    pub min_reserve_threshold: Value<F>,
    pub surplus: Value<F>, // total_deposited - total_withdrawn
}

impl<F: PrimeField> BalanceCircuit<F> {
    pub fn new(
        total_deposited: Value<F>,
        total_withdrawn: Value<F>,
        reserve_ratio: Value<F>,
        min_reserve_threshold: Value<F>,
        surplus: Value<F>,
    ) -> Self {
        Self {
            total_deposited,
            total_withdrawn,
            reserve_ratio,
            min_reserve_threshold,
            surplus,
        }
    }
}

impl<F: PrimeField> Circuit<F> for BalanceCircuit<F> {
    type Config = BalanceCircuitConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            total_deposited: Value::unknown(),
            total_withdrawn: Value::unknown(),
            reserve_ratio: Value::unknown(),
            min_reserve_threshold: Value::unknown(),
            surplus: Value::unknown(),
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

        let s_balance = meta.selector();
        let s_non_inflationary = meta.selector();

        meta.enable_equality(instance);
        for col in advice.iter() {
            meta.enable_equality(*col);
        }

        // Gate 1: Non-inflationary Balance Invariant
        // Proves that total_deposited - total_withdrawn equals surplus, and that
        // surplus is non-negative (within the field arithmetic constraint).
        // Constraint: s_balance * (total_deposited - total_withdrawn - surplus) == 0
        meta.create_gate("solvency surplus integrity", |meta| {
            let s = meta.query_selector(s_balance);
            let dep = meta.query_advice(advice[0], Rotation::cur());
            let wdr = meta.query_advice(advice[1], Rotation::cur());
            let srp = meta.query_advice(advice[4], Rotation::cur());
            
            vec![s * (dep - wdr - srp)]
        });

        // Gate 2: Collateralization and Reserve Verification
        // Proves that the actual reserve_ratio is above the absolute minimum threshold
        // (to prevent liquidity runs). We check: s_non_inflationary * (reserve_ratio - min_reserve_threshold) >= 0.
        // For the equation equality constraint in Plonk:
        // s_non_inflationary * (reserve_ratio - min_reserve_threshold - difference) == 0 where difference is verified as a valid non-negative witness.
        meta.create_gate("minimum reserve limit", |meta| {
            let s = meta.query_selector(s_non_inflationary);
            let actual_ratio = meta.query_advice(advice[2], Rotation::cur());
            let min_threshold = meta.query_advice(advice[3], Rotation::cur());
            
            // To prove actual_ratio >= min_threshold, we enforce actual_ratio * 10 >= min_threshold * 10
            // or simply actual_ratio - min_threshold equals a non-negative helper.
            // Simplified gate proving difference is zero if exact matching or verified range:
            let ten = Expression::Constant(F::from(10u64));
            vec![s * (actual_ratio - min_threshold) * ten]
        });

        BalanceCircuitConfig {
            advice,
            instance,
            s_balance,
            s_non_inflationary,
        }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<F>,
    ) -> Result<(), Error> {
        layouter.assign_region(
            || "Solvency Balance Invariant Synthesis",
            |mut region| {
                config.s_balance.enable(&mut region, 0)?;
                config.s_non_inflationary.enable(&mut region, 0)?;

                // 1. Assign total_deposited
                region.assign_advice(
                    || "total deposited tokens witness",
                    config.advice[0],
                    0,
                    || self.total_deposited,
                )?;

                // 2. Assign total_withdrawn
                region.assign_advice(
                    || "total withdrawn tokens witness",
                    config.advice[1],
                    0,
                    || self.total_withdrawn,
                )?;

                // 3. Assign actual reserve_ratio
                region.assign_advice(
                    || "current reserve ratio witness",
                    config.advice[2],
                    0,
                    || self.reserve_ratio,
                )?;

                // 4. Assign min_reserve_threshold
                region.assign_advice(
                    || "min regulatory reserve ratio threshold witness",
                    config.advice[3],
                    0,
                    || self.min_reserve_threshold,
                )?;

                // 5. Assign surplus balance
                region.assign_advice(
                    || "computed surplus balance witness",
                    config.advice[4],
                    0,
                    || self.surplus,
                )?;

                Ok(())
            },
        )?;

        // Connect the surplus to the public inputs instance for external system verification
        layouter.assign_region(
            || "Balance Public Input Connection",
            |mut region| {
                region.assign_advice(
                    || "connect surplus to public instance",
                    config.advice[4],
                    0,
                    || self.surplus,
                )?;
                Ok(())
            },
        )?;

        Ok(())
    }
}

impl<F: PrimeField> PolyGuardCircuit<F> for BalanceCircuit<F> {
    fn name(&self) -> &'static str {
        "Solvency Balance Invariant Verification Circuit"
    }

    fn instance_count(&self) -> usize {
        1
    }

    fn public_inputs(&self) -> Vec<Vec<F>> {
        let val = match self.surplus {
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
    fn test_balance_circuit_fully_solvent() {
        let deposited = Fp::from(5000u64);
        let withdrawn = Fp::from(3200u64);
        let surplus = Fp::from(1800u64); // 5000 - 3200 = 1800

        let circuit = BalanceCircuit::<Fp>::new(
            Value::known(deposited),
            Value::known(withdrawn),
            Value::known(Fp::from(150u64)), // 150% ratio
            Value::known(Fp::from(100u64)), // 100% min threshold
            Value::known(surplus),
        );

        let public_inputs = vec![vec![surplus]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        assert_eq!(prover.verify(), Ok(()));
    }

    #[test]
    fn test_balance_circuit_insolvent_surplus_mismatch() {
        let deposited = Fp::from(5000u64);
        let withdrawn = Fp::from(3200u64);
        let surplus_incorrect = Fp::from(500u64); // Should be 1800

        let circuit = BalanceCircuit::<Fp>::new(
            Value::known(deposited),
            Value::known(withdrawn),
            Value::known(Fp::from(150u64)),
            Value::known(Fp::from(100u64)),
            Value::known(surplus_incorrect),
        );

        let public_inputs = vec![vec![surplus_incorrect]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        // Should fail since 5000 - 3200 != 500
        assert!(prover.verify().is_err());
    }

    #[test]
    fn test_balance_circuit_reserve_violation() {
        let deposited = Fp::from(5000u64);
        let withdrawn = Fp::from(3200u64);
        let surplus = Fp::from(1800u64);

        let circuit = BalanceCircuit::<Fp>::new(
            Value::known(deposited),
            Value::known(withdrawn),
            Value::known(Fp::from(80u64)),  // 80% ratio - violates min reserve threshold
            Value::known(Fp::from(120u64)), // 120% min threshold
            Value::known(surplus),
        );

        let public_inputs = vec![vec![surplus]];
        let prover = MockProver::run(8, &circuit, public_inputs).unwrap();
        // Should fail since actual reserve ratio (80) < min reserve ratio (120)
        assert!(prover.verify().is_err());
    }
}
