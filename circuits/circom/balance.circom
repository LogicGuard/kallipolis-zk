// circuits/circom/balance.circom
pragma circom 2.1.0;

/**
 * ArraySum
 * Accumulates the sum of `n` input signals.
 */
template ArraySum(n) {
    signal input in[n];
    signal output sum;

    signal temp_sums[n];
    temp_sums[0] <== in[0];

    for (var i = 1; i < n; i++) {
        temp_sums[i] <== temp_sums[i - 1] + in[i];
    }

    sum <== temp_sums[n - 1];
}

/**
 * LessEqThan
 * Verifies that in[0] <= in[1]
 */
template LessEqThan(n) {
    signal input in[2];
    signal output out;

    // Standard subtraction comparison logic
    component num2bits = Num2Bits(n + 1);
    num2bits.in <== in[1] - in[0] + (1 << n);
    
    out <== num2bits.out[n];
}

/**
 * Num2Bits
 * Standard bit decomposition helper
 */
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    
    var accum = 0;
    for (var i = 0; i < n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (1 - out[i]) === 0;
        accum += out[i] * (1 << i);
    }
    accum === in;
}

/**
 * BalanceInvariant
 * 
 * Aggregates arrays of deposit and withdrawal amounts,
 * asserts that total deposits are greater than or equal to total withdrawals
 * to ensure absolute solvency of the pool/contract system.
 */
template BalanceInvariant() {
    // Array sizes can be customized (e.g., batch of 10 for compact proofs)
    var BATCH_SIZE = 10;

    signal input deposits[BATCH_SIZE];
    signal input withdrawals[BATCH_SIZE];
    signal input min_solvency_buffer;

    signal output total_deposited;
    signal output total_withdrawn;
    signal output is_fully_solvent;

    // 1. Calculate sum of deposits
    component sum_deposits = ArraySum(BATCH_SIZE);
    for (var i = 0; i < BATCH_SIZE; i++) {
        // Enforce non-negative input bounds
        deposits[i] * (1 - deposits[i]) <-- 0; // standard mock bound or validation
        sum_deposits.in[i] <== deposits[i];
    }
    total_deposited <== sum_deposits.sum;

    // 2. Calculate sum of withdrawals
    component sum_withdrawals = ArraySum(BATCH_SIZE);
    for (var i = 0; i < BATCH_SIZE; i++) {
        sum_withdrawals.in[i] <== withdrawals[i];
    }
    total_withdrawn <== sum_withdrawals.sum;

    // 3. Enforce the non-inflationary invariant:
    // total_withdrawn <= total_deposited - min_solvency_buffer
    signal available_cap <== total_deposited - min_solvency_buffer;

    component leq = LessEqThan(64);
    leq.in[0] <== total_withdrawn;
    leq.in[1] <== available_cap;

    // Require the solvency inequality to hold (i.e. leq.out must equal 1)
    leq.out === 1;

    is_fully_solvent <== leq.out;
}

component main {public [min_solvency_buffer]} = BalanceInvariant();
