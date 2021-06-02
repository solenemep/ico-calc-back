// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

import "./Token.sol";

// import "./IToken.sol";

contract ICO is AccessControl {
    // State variables
    Token private _token;
    address private _reserve;
    address private _owner;
    bool private _contractClosed;
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
    function startContract() public {
        require(msg.sender == _reserve, "ICO : only owner of tokens can use this function");
        _contractClosed = false;
        _token.approve(address(this), _token.totalSupply());
    }

    receive() external payable {
        // _deposit(msg.sender, msg.value * _tokenPrice);
    }

    function buyTokens() public payable notOwner contractOpen {
        uint256 amount = msg.value * _tokenPrice;
        uint256 reserveBalance = _token.balanceOf(_reserve);
        require(msg.value > 0, "ICO : you have to pay to get tokens");
        require(amount <= reserveBalance, "ICO : do not have enought tokens to sell");
        _nbTokenSold += amount;
        _token.transferFrom(_reserve, msg.sender, amount);
        // event Approval et Transfer dans fonctions approve et transferFrom
        emit Bought(msg.sender, amount);
    }

    function withdraw() public onlyRole(OWNER) contractClosed {
        uint256 icoBalance = _token.balanceOf(address(this));
        require(icoBalance != 0, "ICO : you can not withdraw empty balance");
        payable(msg.sender).transfer(icoBalance);
        emit Withdrawed(msg.sender, icoBalance);
    }

    // En attendant de comprendre comment gérer la fermeture automatique après 2 semaines.
    function closeContract() public onlyRole(OWNER) contractOpen {
        _contractClosed = true;
    }

    // getters
    function token() public view returns (Token) {
        return _token;
    }

    function reserve() public view returns (address) {
        return _reserve;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function isContractClosed() public view returns (bool) {
        return _contractClosed;
    }

    function tokenPrice() public view returns (uint256) {
        return _tokenPrice;
    }

    function nbTokenSold() public view returns (uint256) {
        return _nbTokenSold;
    }

    function gain() public view returns (uint256) {
        return _nbTokenSold * _tokenPrice;
    }
}
