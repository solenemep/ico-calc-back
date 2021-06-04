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
    int256 private _result;
    uint256 public price = 1;

    // Events
    event Added(int256 a, int256 b, int256 result);
    event Substracted(int256 a, int256 b, int256 result);
    event Multiplied(int256 a, int256 b, int256 result);
    event Divided(int256 a, int256 b, int256 result);
    event Modulated(int256 a, int256 b, int256 result);
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
    function add(int256 a, int256 b) public returns (int256) {
        _result = a + b;
        _payOperation(msg.sender);
        emit Added(a, b, _result);
        return _result;
    }

    function sub(int256 a, int256 b) public returns (int256) {
        _result = a - b;
        _payOperation(msg.sender);
        emit Substracted(a, b, _result);
        return _result;
    }

    function mul(int256 a, int256 b) public returns (int256) {
        _result = a * b;
        _payOperation(msg.sender);
        emit Multiplied(a, b, _result);
        return _result;
    }

    function div(int256 a, int256 b) public returns (int256) {
        require(b != 0, "Calculator : can not divide by 0");
        _result = a / b;
        _payOperation(msg.sender);
        emit Divided(a, b, _result);
        return _result;
    }

    function mod(int256 a, int256 b) public returns (int256) {
        _result = a % b;
        _payOperation(msg.sender);
        emit Modulated(a, b, _result);
        return _result;
    }

    function _payOperation(address sender) private enoughtToken {
        _token.transferFrom(sender, address(this), price);
        emit Bought(sender, price);
    }

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
