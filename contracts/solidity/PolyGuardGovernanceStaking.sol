// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title PolyGuard Enterprise Governance Staking & Slashing Vault
/// @notice Decentralized validator staking with automatic slashing conditions for AggLayer equivocation
contract PolyGuardGovernanceStaking {
    struct Validator {
        uint256 stakedAmount;
        uint64 jailedUntil;
        bool isActive;
        address rewardRecipient;
    }

    mapping(address => Validator) public validators;
    uint256 public totalStaked;
    address public immutable guardian;

    event ValidatorRegistered(address indexed validator, uint256 amount);
    event ValidatorSlashed(address indexed validator, uint256 slashedAmount);
    event RewardDistributed(address indexed validator, uint256 reward);

    error Unauthorized();
    error InsufficientStake();
    error ValidatorAlreadyActive();
    error ValidatorJailed();

    constructor(address _guardian) {
        guardian = _guardian;
    }

    modifier onlyGuardian() {
        if (msg.sender != guardian) revert Unauthorized();
        _;
    }

    function registerValidator(address recipient) external payable {
        if (msg.value < 32 ether) revert InsufficientStake();
        if (validators[msg.sender].isActive) revert ValidatorAlreadyActive();

        validators[msg.sender] = Validator({
            stakedAmount: msg.value,
            jailedUntil: 0,
            isActive: true,
            rewardRecipient: recipient
        });

        totalStaked += msg.value;
        emit ValidatorRegistered(msg.sender, msg.value);
    }

    function slashValidator(address validatorAddress, uint256 slashBps) external onlyGuardian {
        Validator storage val = validators[validatorAddress];
        if (!val.isActive) revert Unauthorized();

        uint256 slashAmount = (val.stakedAmount * slashBps) / 10000;
        val.stakedAmount -= slashAmount;
        val.jailedUntil = uint64(block.timestamp + 7 days);

        totalStaked -= slashAmount;
        emit ValidatorSlashed(validatorAddress, slashAmount);
    }
}
