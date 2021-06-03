// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

import "./Token.sol";

// import "./IToken.sol";

/// @title ICO
/// @author Solène PETTIER
/// @notice You can use this contract once, to have a 2-weeks-long ICO
/// @dev This ICO connects to a ERC20 contract

contract ICO is AccessControl {
    using Address for address payable;
    // State variables
    Token private _token;
    address private _reserve;
    address private _owner;
    uint256 private _startContract;
    uint256 private _tokenPrice;
    uint256 private _nbTokenSold;
    bytes32 public constant OWNER = keccak256("OWNER");

    // Events
    event Withdrawed(address indexed sender, uint256 amount);
    event Bought(address indexed sender, uint256 amount);

    // constructor
    constructor(
        address tokenAddress,
        address owner_,
        uint256 tokenPrice_
    ) {
        _token = Token(tokenAddress);
        _reserve = _token.reserve();
        _owner = owner_;
        _setupRole(OWNER, _owner);
        _tokenPrice = tokenPrice_;
        _startContract = block.timestamp;
    }

    // modifiers
    modifier notOwner() {
        require(!hasRole(OWNER, msg.sender), "ICO : owner can not use this function");
        _;
    }
    modifier salesOn() {
        require(block.timestamp <= _startContract + 2 * 1 weeks, "ICO : sales is not open");
        _;
    }
    modifier salesOff() {
        require(block.timestamp >= _startContract + 2 * 1 weeks, "ICO : sales is not over");
        _;
    }

    // functions
    receive() external payable {
        _buyTokens(msg.sender, msg.value);
    }

    function buyTokens() public payable {
        _buyTokens(msg.sender, msg.value);
    }

    function _buyTokens(address sender, uint256 value) private notOwner salesOn {
        uint256 amount = value / _tokenPrice;
        uint256 reserveBalance = _token.balanceOf(_reserve);
        require(value > 0, "ICO : you have to pay to get tokens");
        require(amount <= reserveBalance, "ICO : do not have enought tokens to sell");
        _nbTokenSold += amount;
        _token.transferFrom(_reserve, sender, amount);
        // event Approval et Transfer dans fonctions approve et transferFrom
        emit Bought(sender, amount);
    }

    function withdraw() public onlyRole(OWNER) salesOff {
        uint256 icoBalance = address(this).balance;
        require(icoBalance != 0, "ICO : you can not withdraw empty balance");
        payable(msg.sender).sendValue(address(this).balance);
        emit Withdrawed(msg.sender, icoBalance);
    }

    // getters
    /// @notice Allow user to get Token address
    /// @dev Function is a getter to return Token address
    /// @return _token Token
    function token() public view returns (Token) {
        return _token;
    }

    /// @notice Allow user to get reserve address
    /// @dev Function is a getter to return reserve address
    /// @return _reserve address
    function reserve() public view returns (address) {
        return _reserve;
    }

    /// @notice Allow user to get owner address
    /// @dev Function is a getter to return owner address
    /// @return _owner address
    function owner() public view returns (address) {
        return _owner;
    }

    /// @notice Allow user to get start contract date
    /// @dev Function is a getter to return start contract timestamps
    /// @return _startContract uint256
    function startContract() public view returns (uint256) {
        return _startContract;
    }

    /// @notice Allow user to get token price in ether
    /// @dev Function is a getter to return token price uint256
    /// @return _tokenPrice uint256
    function tokenPrice() public view returns (uint256) {
        return _tokenPrice;
    }

    /// @notice Allow user to get the number of token sold
    /// @dev Function is a getter to return _nbTokenSold uint256
    /// @return _nbTokenSold uint256
    function nbTokenSold() public view returns (uint256) {
        return _nbTokenSold;
    }

    /// @notice Allow user to get the number of token sold
    /// @dev Function is a getter to return _nbTokenSold uint256
    /// @return _nbTokenSold uint256
    function gain() public view returns (uint256) {
        return _nbTokenSold * _tokenPrice;
    }
}
