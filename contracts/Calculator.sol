// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Token.sol";

// import "./IToken.sol";

/// @title Calculator
/// @author Solène PETTIER
/// @notice This is a simple calculator (+, -, *, /, %)
/// @dev This calculator connects to a ERC20 contract

contract Calculator is Ownable {
    using Address for address payable;
    // State variables
    Token private _token;
    address private _owner;
    uint256 public price = 1;

    // Events
    event Added(int256 a, int256 b);
    event Substracted(int256 a, int256 b);
    event Multiplied(int256 a, int256 b);
    event Divided(int256 a, int256 b);
    event Modulated(int256 a, int256 b);
    event Bought(address indexed sender, uint256 price);
    event Withdrawed(address indexed sender, uint256 amount);

    // constructor
    constructor(address tokenAddress, address owner_) {
        _token = Token(tokenAddress);
        _owner = owner_;
        transferOwnership(_owner);
    }

    // modifiers
    modifier enoughtToken() {
        require(_token.balanceOf(msg.sender) >= price, "Calculator : operation cost 1 TKN");
        _;
    }

    // functions
    /// @notice Allow user to make an addition in exchange of TKN
    /// @dev Simple return value and call for paying function
    /// @param a first parameter of operation
    /// @param b second parameter of operation
    /// @return _result, result of operation
    function add(int256 a, int256 b) public returns (int256) {
        _payOperation(msg.sender);
        emit Added(a, b);
        return a + b;
    }

    /// @notice Allow user to make a substraction in exchange of TKN
    /// @dev Simple return value and call for paying function
    /// @param a first parameter of operation
    /// @param b second parameter of operation
    /// @return _result, result of operation
    function sub(int256 a, int256 b) public returns (int256) {
        _payOperation(msg.sender);
        emit Substracted(a, b);
        return a - b;
    }

    /// @notice Allow user to make a multiplication in exchange of TKN
    /// @dev Simple return value and call for paying function
    /// @param a first parameter of operation
    /// @param b second parameter of operation
    /// @return _result, result of operation
    function mul(int256 a, int256 b) public returns (int256) {
        _payOperation(msg.sender);
        emit Multiplied(a, b);
        return a * b;
    }

    /// @notice Allow user to make a division in exchange of TKN
    /// @dev Simple return value and call for paying function
    /// @param a first parameter of operation
    /// @param b second parameter of operation
    /// @return _result, result of operation
    function div(int256 a, int256 b) public returns (int256) {
        require(b != 0, "Calculator : can not divide by 0");
        _payOperation(msg.sender);
        emit Divided(a, b);
        return a / b;
    }

    /// @notice Allow user to make a modulo in exchange of TKN
    /// @dev Simple return value and call for paying function
    /// @param a first parameter of operation
    /// @param b second parameter of operation
    /// @return _result, result of operation
    function mod(int256 a, int256 b) public returns (int256) {
        _payOperation(msg.sender);
        emit Modulated(a, b);
        return a % b;
    }

    /// @notice Called when anyone makes an operation
    /// @dev Calls transfer function from ERC20 : Token
    /// @param sender the one that makes the operation
    function _payOperation(address sender) private enoughtToken {
        _token.transferFrom(sender, address(this), price);
        emit Bought(sender, price);
    }

    /// @notice Allow owner of Calculator to withdraw his fund
    /// @dev Calls transfer function from ERC20 : Token
    function withdraw() public onlyOwner {
        uint256 calcBalance = _token.balanceOf(address(this));
        require(calcBalance != 0, "Calculator : you can not withdraw empty balance");
        _token.transfer(msg.sender, calcBalance);
        emit Withdrawed(msg.sender, calcBalance);
    }

    // getters
    /// @notice Allow user to get Token address
    /// @dev Function is a getter to return Token address
    /// @return _token Token
    function token() public view returns (Token) {
        return _token;
    }
}
