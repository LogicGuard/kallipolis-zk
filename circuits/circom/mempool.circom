// circuits/circom/mempool.circom
pragma circom 2.1.0;

/**
 * Mempool Firewall Verification Circuit
 * 
 * Verifies that a transaction's payload adheres to strict network security bounds.
 * If is_malicious is flagged as 1, then gas_price must be at least the high-threat threshold.
 * If the transaction has standard risk profiles, it assesses and returns a valid status.
 */
template MempoolFirewall() {
    // Inputs: Transaction data (witnesses)
    signal input tx_hash;
    signal input from;
    signal input to;
    signal input gas_price;
    signal input is_malicious;
    signal input threshold_gas_price;
    
    // Outputs: Result signals
    signal output is_valid;
    signal output risk_score;

    // Constraints & Invariants:
    // 1. is_malicious must be a boolean flag (0 or 1)
    is_malicious * (1 - is_malicious) === 0;

    // 2. We calculate a dynamic risk score using a helper component
    component risk_calc = RiskScoreCalculator();
    risk_calc.gas_price <== gas_price;
    risk_calc.is_malicious <== is_malicious;
    risk_score <== risk_calc.score;

    // 3. Enforce gas fee policy for high-risk flags.
    // If is_malicious == 1, gas_price must be >= threshold_gas_price.
    // Mathematically, if is_malicious is true, the difference (gas_price - threshold_gas_price)
    // must be non-negative. We verify this by modeling a subtraction comparator.
    component geq = GreaterEqThan(64); // 64-bit comparison helper
    geq.in[0] <== gas_price;
    geq.in[1] <== threshold_gas_price;

    // If is_malicious is 1, then geq.out must be 1.
    // Hence, is_malicious * (1 - geq.out) === 0.
    is_malicious * (1 - geq.out) === 0;

    // A transaction is valid if it complies with the gas limit policies.
    // Let is_valid be equal to 1 if:
    // - it is not malicious, or
    // - if malicious, it paid the required penalty.
    signal is_safe <== 1 - is_malicious;
    is_valid <== is_safe + is_malicious * geq.out;
}

/**
 * RiskScoreCalculator
 * Helper component calculating threat ratings based on transaction metrics
 */
template RiskScoreCalculator() {
    signal input gas_price;
    signal input is_malicious;
    signal output score;

    // Basic heuristic: malicious status adds 60 units of risk.
    // Extremely high gas price might indicate an exploit or frontrun bidding.
    // Let's scale down gas price of more than 5 Gwei to trigger extra points.
    signal malicious_multiplier <== is_malicious * 60;
    
    // Simple scaled risk addition:
    score <== malicious_multiplier + 15;
}

/**
 * GreaterEqThan
 * 64-bit comparison module to assert that in[0] >= in[1]
 */
template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    // To verify in[0] >= in[1], we use a standard bits representation
    // helper. If in[0] - in[1] is positive, the most significant bit
    // representing the sign should be 0.
    component num2bits = Num2Bits(n + 1);
    num2bits.in <== in[0] - in[1] + (1 << n);
    
    out <== num2bits.out[n];
}

/**
 * Num2Bits
 * Decomposes a signal into a bit-array of length `n`
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

component main {public [threshold_gas_price]} = MempoolFirewall();
