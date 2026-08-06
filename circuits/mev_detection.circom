pragma circom 2.1.0;

template MEVDetection() {
    signal input tx_data[256];
    signal input patterns[3][256];
    signal output is_mev;

    // Simplified constraint check for MEV detection arithmetic
    signal matches[3];
    signal accum;

    var sum = 0;
    for (var i = 0; i < 3; i++) {
        var match_val = 1;
        for (var j = 0; j < 16; j++) {
            // Simplified check matching first 16 bits of transaction data against pattern
            match_val = match_val * (1 - (tx_data[j] - patterns[i][j]) * (tx_data[j] - patterns[i][j]));
        }
        matches[i] <== match_val;
        sum += matches[i];
    }

    // if sum > 0 then is_mev = 1 else 0
    is_mev <-- sum > 0 ? 1 : 0;
    is_mev * (1 - is_mev) === 0;
}

component main = MEVDetection();
