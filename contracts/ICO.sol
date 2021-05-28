// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ICO is ERC20, AccessControl {
    // State variables
    address private _owner;
    bool private _contractClosed; 
    uint256 private _tokenPrice;
    uint256 private _nbTokenSold;
    uint256 private _gain;
    bytes32 public constant OWNER = keccak256("OWNER");

    // Events
    event Withdrawed(address indexed sender, uint256 amount);
    event Bought(address indexed sender, uint256 amount);

    // constructor
    constructor(address owner_, uint256 initialSupply, uint256 tokenPrice_) ERC20("ICO", "ICO") {
        _owner = owner_;
        _tokenPrice = tokenPrice_;
        _setupRole(OWNER, _owner);
        _mint(owner_, initialSupply);
    }

    // modifiers
    modifier notOwner() {
       require(!hasRole(OWNER, msg.sender), "ICO : owner can not use this function");
       _;
    }
    modifier contractOpen() {
       require(_contractClosed == false, "ICO : contract is not open");
       _;
    }
    modifier contractClosed() {
       require(_contractClosed == true, "ICO : contract is not closed");
       _;
    }

    // functions
/*
    function receive() public notOwner contractOpen {

    }
*/
    function buyTokens() public notOwner contractOpen payable {
/*
    uint256 amountTobuy = msg.value;
    uint256 dexBalance = token.balanceOf(address(this));
    require(amountTobuy > 0, "You need to send some ether");
    require(amountTobuy <= dexBalance, "Not enough tokens in the reserve");
    token.transfer(msg.sender, amountTobuy);
    emit Bought(amountTobuy);
*/
        require(msg.value > 0, "ICO : you have to pay to get tokens");
        uint256 amount = msg.value * _tokenPrice;
        _nbTokenSold += amount; 
        _gain += msg.value; 
        approve(msg.sender, amount);
        transferFrom(_owner, msg.sender, amount);
        emit Bought(msg.sender, amount); 
    }
    function withdraw() public onlyRole(OWNER) contractClosed payable {
        require(balanceOf(msg.sender) != 0, "ICO : you can not withdraw empty balance");
        
        //payable(msg.sender).sendValue(balances_);
        emit Withdrawed(msg.sender, 10); 
    }

    // getters
    function owner() public view returns (address) {
        return _owner;
    }
    function isConstractClosed() public view returns (bool) {
        return _contractClosed;
    }
    function tokenPrice() public view returns (uint256) {
        return _tokenPrice;
    }
    function nbTokenSold() public view returns (uint256) {
        return _nbTokenSold;
    }
    function gain() public view returns (uint256) {
        return _gain;
    }
}
