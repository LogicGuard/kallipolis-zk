// PolyGuard Cairo 2.0 STARK State Transition Prover
use core::pedersen::pedersen;
use starknet::ContractAddress;

#[derive(Copy, Drop, Serde)]
pub struct RollupBatchState {
    pub rollup_id: u32,
    pub previous_root: felt252,
    pub new_root: felt252,
    pub transaction_count: u32,
}

#[generate_trait]
pub impl CairoStarkVerifierImpl of CairoStarkVerifierTrait {
    fn verify_stark_transition(state: RollupBatchState, expected_hash: felt252) -> bool {
        let h1 = pedersen(state.previous_root, state.new_root);
        let h2 = pedersen(h1, state.rollup_id.into());
        let final_commitment = pedersen(h2, state.transaction_count.into());
        final_commitment == expected_hash
    }
}
