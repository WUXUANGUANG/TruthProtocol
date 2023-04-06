// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voting {
    IERC20 public token;
    uint256 public minStake;
    uint256 public lockPeriod = 3 days;

    struct Vote {
        uint256 upvotes;
        uint256 downvotes;
    }

    struct LockedToken {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(string => Vote) public votes;
    mapping(address => mapping(string => uint256)) public userVotes;
    mapping(address => LockedToken[]) public lockedTokens;

    event VoteCast(address indexed user, string website, uint256 amount, bool isUpvote);
    event TokensUnlocked(address indexed user, uint256 amount);

    constructor(IERC20 _token, uint256 _minStake) {
        token = _token;
        minStake = _minStake;
    }

    function voteMyStake(string memory website, uint256 amount, bool isUpvote) public {
        require(amount >= minStake, "Amount should be greater or equal to the minimum stake");
        token.transferFrom(msg.sender, address(this), amount);

        Vote storage vote = votes[website];
        if (isUpvote) {
            vote.upvotes += amount;
        } else {
            vote.downvotes += amount;
        }

        userVotes[msg.sender][website] = userVotes[msg.sender][website] + amount;
        lockedTokens[msg.sender].push(LockedToken(amount, block.timestamp + lockPeriod));
        emit VoteCast(msg.sender, website, amount, isUpvote);
    }

    function getVoteDetails(string memory website) public view returns (uint256 upvotes, uint256 downvotes) {
        Vote storage vote = votes[website];
        return (vote.upvotes, vote.downvotes);
    }

    function unlockTokens() public {
        uint256 unlockedAmount = 0;
        LockedToken[] storage userLockedTokens = lockedTokens[msg.sender];
        for (uint256 i = 0; i < userLockedTokens.length; i++) {
            if (userLockedTokens[i].unlockTime <= block.timestamp) {
                unlockedAmount += userLockedTokens[i].amount;
                userLockedTokens[i] = userLockedTokens[userLockedTokens.length - 1];
                userLockedTokens.pop();
                i--;
            }
        }

        require(unlockedAmount > 0, "No tokens available for unlock");
        token.transfer(msg.sender, unlockedAmount);
        emit TokensUnlocked(msg.sender, unlockedAmount);
    }
}