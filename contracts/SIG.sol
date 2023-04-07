// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestToken is ERC20 {
    constructor() ERC20("SIGTestToken", "SIG") {
        _mint(msg.sender, 100000000000000000000000000);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function faucet(address _recipient, uint256 _amount) public {
        _mint(_recipient, _amount);
    }
}