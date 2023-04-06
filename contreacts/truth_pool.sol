// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voting {

    IERC20 public token;
    uint256 public minStake;
    uint256 public other_score = 1;
    uint256 public trust_score = 100;

    //此版本每个池子共享一个对赌池，后期会升级为每一个池子一个对赌池并由factory合约控制。

    //本实现应该会有tricky的实现方式，但是我们还没想到

    //存储每个池子的每一笔交易信息
    struct poolTrade {
        address trade_address;
        uint256 trade_timestamp;
        uint256 amount;
        uint trust_score;
        uint256 other_score;
        bool isUpvote;
    }


    //存储外部的池子信息
    struct poolState {
        uint256 upvotes;
        uint256 downvotes;
        uint256 pool_trade_times;
    }


    //mapping(string => Vote) public votes;

    mapping(string => mapping(uint256 => poolState)) public web_pool_state;
    //网址/交割日期/交易次数
    mapping(string => mapping(uint256 => mapping(uint256 => poolTrade))) public web_pool_trade;

    mapping(address => mapping(string => mapping(uint256 => mapping(bool => uint256)))) public userVotes;
    
    //event VoteCast(address indexed user, string website, uint256 amount, bool isUpvote);
    //event TokensUnlocked(address indexed user, uint256 amount);

    constructor(IERC20 _token, uint256 _minStake) {
        token = _token;
        minStake = _minStake;
    }




    function voteMyStake(string memory website,uint256 delivery_date ,uint256 amount, bool isUpvote) public {
        require(amount >= minStake, "Amount should be greater or equal to the minimum stake");
        isFutureDate(delivery_date);
        token.transferFrom(msg.sender, address(this), amount);

        //Vote storage vote = votes[website];
        poolState storage pool_state = web_pool_state[website][delivery_date];
        if (isUpvote) {
            pool_state.upvotes += amount;
        } else {
            pool_state.downvotes += amount;
        }

        pool_state.pool_trade_times += 1;

        poolTrade storage pool_trade = web_pool_trade[website][delivery_date][pool_state.pool_trade_times];

        pool_trade.trade_address = msg.sender;
        pool_trade.trade_timestamp = block.timestamp;
        pool_trade.amount = amount;
        pool_trade.isUpvote = isUpvote;
        pool_trade.trust_score = get_trust_score();
        pool_trade.other_score = get_other_score();

        if (isUpvote) {
            userVotes[msg.sender][website][delivery_date][true] = userVotes[msg.sender][website][delivery_date][true] + amount;

        } else {
            userVotes[msg.sender][website][delivery_date][false] = userVotes[msg.sender][website][delivery_date][false] + amount;
        }


        //lockedTokens[msg.sender].push(LockedToken(amount, block.timestamp + lockPeriod));
        //emit VoteCast(msg.sender, website, amount, isUpvote);
    }


    function getPoolDetails(string memory website,uint256 delivery_date) public view returns (uint256 upvotes, uint256 downvotes,uint256 pool_trade_times) {
        
        poolState storage pool_state = web_pool_state[website][delivery_date];
        return (pool_state.upvotes, pool_state.downvotes,pool_state.pool_trade_times);

    }


    function getUserDetails(string memory website,uint256 delivery_date) public view returns (uint256 upvotes, uint256 downvotes,uint256 pool_trade_times) {
        
        poolState storage pool_state = web_pool_state[website][delivery_date];
        return (pool_state.upvotes, pool_state.downvotes,pool_state.pool_trade_times);

    }




    function unlockTokens() public {
        // uint256 unlockedAmount = 0;
        // LockedToken[] storage userLockedTokens = lockedTokens[msg.sender];
        // for (uint256 i = 0; i < userLockedTokens.length; i++) {
        //     if (userLockedTokens[i].unlockTime <= block.timestamp) {
        //         unlockedAmount += userLockedTokens[i].amount;
        //         userLockedTokens[i] = userLockedTokens[userLockedTokens.length - 1];
        //         userLockedTokens.pop();
        //         i--;
        //     }
        // }

        // require(unlockedAmount > 0, "No tokens available for unlock");
        // token.transfer(msg.sender, unlockedAmount);
        // emit TokensUnlocked(msg.sender, unlockedAmount);
    }


    function get_trust_score() public view returns (uint256 trust_score1){
        return trust_score;
    }


    function get_other_score() public view  returns (uint256 other_score1){
        return other_score;
    }

    
    function isFutureDate(uint256 date) public view returns (bool) {
        // solidity没有内置时间日期函数，精确的未来判断在函数datetime内，为了方便逻辑实现优先在这里选择直接类出来。
        require(date > block.timestamp, "Date should be in the future");
        require(date == 1688054400 || date == 1696003200 || date == 1703952000, "Date should be the end of the quarter");
        return true;
    }

}


