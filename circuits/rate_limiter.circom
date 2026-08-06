pragma circom 2.1.0;

template RateLimiter() {
    signal input request_count[24];
    signal input limit;
    signal output within_limit;

    signal sums[24];
    var running_sum = 0;

    for (var i = 0; i < 24; i++) {
        running_sum += request_count[i];
    }

    // Check if running_sum <= limit
    signal diff;
    diff <-- limit - running_sum;
    
    // Non-negative check using bit decomposition or comparison flag
    signal is_valid;
    is_valid <-- running_sum <= limit ? 1 : 0;
    is_valid * (1 - is_valid) === 0;

    within_limit <== is_valid;
}

component main = RateLimiter();
