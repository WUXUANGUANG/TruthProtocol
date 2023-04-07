// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract Voting {

    using SafeMath for uint256;


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
        uint256 trust_score;
        uint256 other_score;
        bool isUpvote;
    }

    //存储外部的池子信息
    struct poolState {
        uint256 upvotes;
        uint256 downvotes;
        uint256 pool_trade_times;
        uint pool_state;
    }

    struct userState {
        uint256 upvotes;
        uint256 downvotes; 
        //uint256 pool_trade_nums;
        uint256 extracted_premium;
        uint256 extracetd_interest;
        bool extracetd_compensate;
    }

    struct factoryState {
        uint256 upvotes;
        uint256 downvotes;
        uint256[] website_list;
    }

    // struct userTrade {
    //     string website;
    //     string
    //     uint256 upvotes;
    //     uint256 downvotes;
    //     uint256 user_trade_times;
    // }

    //mapping(string => Vote) public votes;

    mapping(uint256 => factoryState) public web_factory_state;

    mapping(string => mapping(uint256 => poolState)) public web_pool_state;

    //网址/交割日期/交易次数
    mapping(string => mapping(uint256 => mapping(uint256 => poolTrade)))
        public web_pool_trade;

    mapping(address => mapping(string => mapping(uint256 => userState)))
        public userVotes;

    //mapping(address => uint256) public userVoteTimes;

    //event VoteCast(address indexed user, string website, uint256 amount, bool isUpvote);
    //event TokensUnlocked(address indexed user, uint256 amount);

    constructor(IERC20 _token, uint256 _minStake) {
        token = _token;
        minStake = _minStake;
    }

    //function get_staking_reward():

    function changePoolState(string memory website, uint256 delivery_date,uint external_state) public {

        //这里先改成一个人人可以调用的,后面将接入仲裁机制与CMD体系
        web_pool_state[website][delivery_date].pool_state = external_state;

    }


    function voteMyStake(
        string memory website,
        uint256 delivery_date,
        uint256 amount,
        bool isUpvote
    ) public {
        require(
            amount >= minStake,
            "Amount should be greater or equal to the minimum stake"
        );
        //isFutureDate(delivery_date);
        token.transferFrom(msg.sender, address(this), amount);

        //Vote storage vote = votes[website];
        poolState storage pool_state = web_pool_state[website][delivery_date];
        if (isUpvote) {
            pool_state.upvotes += amount;
        } else {
            pool_state.downvotes += amount;
        }

        pool_state.pool_trade_times += 1;

        poolTrade storage pool_trade = web_pool_trade[website][delivery_date][
            pool_state.pool_trade_times
        ];

        pool_trade.trade_address = msg.sender;
        pool_trade.trade_timestamp = block.timestamp;
        pool_trade.amount = amount;
        pool_trade.isUpvote = isUpvote;
        pool_trade.trust_score = get_trust_score();
        pool_trade.other_score = get_other_score();

        if (isUpvote) {
            userVotes[msg.sender][website][delivery_date].upvotes +=
                amount;
        } else {
            userVotes[msg.sender][website][delivery_date].downvotes +=
                amount;
        }

        //lockedTokens[msg.sender].push(LockedToken(amount, block.timestamp + lockPeriod));
        //emit VoteCast(msg.sender, website, amount, isUpvote);
    }

    function getPoolDetails(string memory website, uint256 delivery_date)
        public
        view
        returns (
            uint256 upvotes,
            uint256 downvotes,
            uint256 pool_trade_times
        )
    {
        poolState storage pool_state = web_pool_state[website][delivery_date];
        return (
            pool_state.upvotes,
            pool_state.downvotes,
            pool_state.pool_trade_times
        );
    }

    function getUserDetails(
        address user_address,
        string memory website,
        uint256 delivery_date
    ) public view returns (uint256 upvotes, uint256 downvotes) {
        return (
            userVotes[user_address][website][delivery_date].upvotes,
            userVotes[user_address][website][delivery_date].downvotes
        );
    }

    //计算提取本金部分
    function getUsersPrincipal(
        address user_address,
        string memory website,
        uint256 delivery_date
    )

//这里有个错，可能会在一定特殊情况下触发双向的扣费，之后改。
        public
        view
        returns (
            //uint256 user_up_principal1,
            //uint256 user_down_principal1,
            uint256 user_up_premium1,
            uint256 user_down_premium1
        )
    {
        //计算单用户在某池截至当前的剩余本金
        uint256 i;
        uint256 user_up_principal = 0;
        uint256 user_down_principal = 0;

        uint256 user_s_up_principal = 0;
        uint256 user_s_down_principal = 0;

        uint256 user_up_premium = 0;
        uint256 user_down_premium = 0;
        uint256 last_user_timestamp = 0;

        for (
            i = 1;
            i <= web_pool_state[website][delivery_date].pool_trade_times;
            i += 1
        ) {
            //用户的剩余本金按照时间计算扣除的保费总和
            if (user_s_up_principal < user_s_down_principal) {
                user_up_premium +=
                    (user_up_principal *
                        (
                            web_pool_trade[website][delivery_date][i]
                                .trade_timestamp - last_user_timestamp)) /
                    (delivery_date - last_user_timestamp);

                user_up_principal -= 
                    (user_up_principal *
                        (
                            web_pool_trade[website][delivery_date][i]
                                .trade_timestamp - last_user_timestamp)) /
                    (delivery_date - last_user_timestamp);

            } else {
                user_down_premium +=
                    (user_down_principal *
                        (
                            web_pool_trade[website][delivery_date][i]
                                .trade_timestamp - last_user_timestamp)) /
                    (delivery_date - last_user_timestamp);

                user_down_principal -=
                    (user_down_principal *
                        (
                            web_pool_trade[website][delivery_date][i].trade_timestamp - last_user_timestamp)) 
                            /
                    (delivery_date - last_user_timestamp);
            }

            last_user_timestamp = web_pool_trade[website][delivery_date][i].trade_timestamp;

            //统计当前位置上的总体质押数量
            if (web_pool_trade[website][delivery_date][i].isUpvote) {
                user_s_up_principal += web_pool_trade[website][delivery_date][i]
                    .amount;
            } else {
                user_s_down_principal += web_pool_trade[website][delivery_date][
                    i
                ].amount;
            }

            //统计当前位置上的用户剩余质押资金
            if (
                web_pool_trade[website][delivery_date][i].trade_address ==
                user_address
            ) {
                if (web_pool_trade[website][delivery_date][i].isUpvote) {
                    user_up_principal += web_pool_trade[website][delivery_date][
                        i
                    ].amount;
                } else {
                    user_down_principal += web_pool_trade[website][
                        delivery_date
                    ][i].amount;
                }
            }

        uint256 max_time;
        //uint256 sett = delivery_date.max(block.timestamp);
        if(delivery_date>block.timestamp){
            max_time = block.timestamp;
        }else{
            max_time = delivery_date;
        }

        if (user_s_up_principal < user_s_down_principal) {
            user_up_premium +=
                (user_up_principal *
                    (
                        max_time - last_user_timestamp
                        )) /
                (delivery_date - last_user_timestamp);

            user_up_principal -= 
                (user_up_principal *
                    (
                        max_time- last_user_timestamp)) /
                (delivery_date - last_user_timestamp);

        } else {
            user_down_premium +=
                (user_down_principal *
                    (
                        max_time - last_user_timestamp)) /
                (delivery_date - last_user_timestamp);

            user_down_principal -=
                (user_down_principal *
                    (
                        max_time - last_user_timestamp)) /
                (delivery_date - last_user_timestamp);
        }

        }


        return (
            //user_up_principal,
            //user_down_principal,
            user_up_premium,
            user_down_premium
        );
    } 

    //因为一个用户如果其赢了可以赢得对面的本金和保费，输了会输掉本金也会交保费，所以我们优先计算两侧如果赢了的话会获得的赔付收益。








    function withdrawPremium(string memory website,uint256 delivery_date) public {
        //提取池子内的保费收入。

        uint256 user_can_withdraw_premium_up = 0;
        uint256 user_can_withdraw_premium_down = 0;
        (user_can_withdraw_premium_up,user_can_withdraw_premium_down) = getUsersPrincipal(msg.sender,website,delivery_date);
        uint256 amount = user_can_withdraw_premium_up + user_can_withdraw_premium_down - userVotes[msg.sender][website][delivery_date].extracted_premium;
        
        token.approve(msg.sender, amount);
        token.transfer(msg.sender, amount);

        require(amount>0,"There is no income to draw on");
        userVotes[msg.sender][website][delivery_date].extracted_premium += amount;

    }

    
    function withdrawCompensate(string memory website,uint256 delivery_date) public {
        //提取池子内的赔付收入。
        require(delivery_date < block.timestamp, "Before time");
        require(!userVotes[msg.sender][website][delivery_date].extracetd_compensate,"Only one claim can be made");

        uint256 user_can_withdraw_premium_up = 0;
        uint256 user_can_withdraw_premium_down = 0;
        uint256 user_upvotes=0;
        uint256 user_downvotes=0;

        (user_upvotes,user_downvotes) = getUserDetails(msg.sender,website,delivery_date);
        (user_can_withdraw_premium_up,user_can_withdraw_premium_down) = getUsersPrincipal(msg.sender,website,delivery_date);
        uint256 amount = user_upvotes+ user_downvotes-user_can_withdraw_premium_up - user_can_withdraw_premium_down;
        
        token.approve(msg.sender, amount);
        token.transfer(msg.sender, amount);

        userVotes[msg.sender][website][delivery_date].extracetd_compensate = true;

    }



    // function unlockTokens() public {
    //     // uint256 unlockedAmount = 0;
    //     // LockedToken[] storage userLockedTokens = lockedTokens[msg.sender];
    //     // for (uint256 i = 0; i < userLockedTokens.length; i++) {
    //     //     if (userLockedTokens[i].unlockTime <= block.timestamp) {
    //     //         unlockedAmount += userLockedTokens[i].amount;
    //     //         userLockedTokens[i] = userLockedTokens[userLockedTokens.length - 1];
    //     //         userLockedTokens.pop();
    //     //         i--;
    //     //     }
    //     // }
    //     // require(unlockedAmount > 0, "No tokens available for unlock");
    //     // token.transfer(msg.sender, unlockedAmount);
    //     // emit TokensUnlocked(msg.sender, unlockedAmount);
    // }




    function get_trust_score() public view returns (uint256 trust_score1) {
        return trust_score;
    }

    function get_other_score() public view returns (uint256 other_score1) {
        return other_score;
    }

    function isFutureDate(uint256 date) public view returns (bool) {
        // solidity没有内置时间日期函数，精确的未来判断在函数datetime内，为了方便逻辑实现优先在这里选择直接类出来。
        require(date > block.timestamp - 1000, "Date should be in the future");
        //require(date == 1688054400 || date == 1696003200 || date == 1703952000, "Date should be the end of the quarter");
        require(
            date == 1682784000 || date == 1688054400 || date == 1696003200 || date == 1703952000,
            "Date should be the end of the quarter"
        );
        return true;
    }
}

//用户个人地址遍历？//
//一级域名正则化筛选？//
