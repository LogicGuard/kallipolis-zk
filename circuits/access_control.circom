pragma circom 2.1.0;

template AccessControl() {
    signal input user_address;
    signal input allowed_address;
    signal input authorized_flag;
    signal output authorized;

    // Check if user matches allowed address
    signal diff;
    diff <== user_address - allowed_address;
    
    // If diff == 0, address matches
    signal inverse;
    inverse <-- diff == 0 ? 0 : 1 / diff;
    
    signal is_equal;
    is_equal <-- diff == 0 ? 1 : 0;
    is_equal * diff === 0;

    authorized <== is_equal * authorized_flag;
    authorized * (1 - authorized) === 0;
}

component main = AccessControl();
