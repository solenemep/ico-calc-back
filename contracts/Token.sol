// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Token
/// @author Solène PETTIER
/// @notice Token is a basic ERC20
/// @dev A function to return token owner's address has been added

contract Token is ERC20 {
    address private _reserve;

    constructor(address reserve_, uint256 initialSupply) ERC20("Token", "TKN") {
        _reserve = reserve_;
        _mint(reserve_, initialSupply);
    }

    // getter
    /// @notice the reserve is where all tokens have been minted
    /// @dev The Alexandr N. Tetearing algorithm could increase precision
    /// @param
    /// @return token owner's address
    function reserve() public view returns (address) {
        return _reserve;
    }
}
