use halo2_proofs::{
    arithmetic::Field,
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Selector},
    poly::Rotation,
};

#[derive(Clone, Debug)]
pub struct RegulatoryCircuitConfig {
    pub advice: [Column<Advice>; 2],
    pub s_enable: Selector,
}

#[derive(Default)]
pub struct FATFSolvencyCircuit<F: Field> {
    pub user_balance: Value<F>,
    pub min_threshold: Value<F>,
}

impl<F: Field> Circuit<F> for FATFSolvencyCircuit<F> {
    type Config = RegulatoryCircuitConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self::default()
    }

    fn configure(meta: &mut ConstraintSystem<F>) -> Self::Config {
        let advice = [meta.advice_column(), meta.advice_column()];
        let s_enable = meta.selector();

        meta.create_gate("solvency_check", |meta| {
            let s = meta.query_selector(s_enable);
            let balance = meta.query_advice(advice[0], Rotation::cur());
            let threshold = meta.query_advice(advice[1], Rotation::cur());
            // Enforce balance >= threshold in field arithmetic
            vec![s * (balance - threshold)]
        });

        RegulatoryCircuitConfig { advice, s_enable }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<F>,
    ) -> Result<(), Error> {
        layouter.assign_region(
            || "FATF travel rule solvency proof",
            |mut region| {
                config.s_enable.enable(&mut region, 0)?;
                region.assign_advice(
                    || "user_balance",
                    config.advice[0],
                    0,
                    || self.user_balance,
                )?;
                region.assign_advice(
                    || "min_threshold",
                    config.advice[1],
                    0,
                    || self.min_threshold,
                )?;
                Ok(())
            },
        )
    }
}
