// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestStoreToken
 * @dev A simple ERC20 token for testing the eStore contract
 */
contract TestStoreToken is ERC20 {
    uint256 public constant MINT_AMOUNT = 1000 * 10**18; // 1000 tokens with 18 decimals

    constructor() ERC20("Test Store Token", "TStore") {}

    /**
     * @dev Allows anyone to mint 1000 tokens to themselves
     */
    function mint() external {
        _mint(msg.sender, MINT_AMOUNT);
    }
} 