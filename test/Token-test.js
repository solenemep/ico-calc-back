/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Token', async function () {
  let Token, token, dev, reserve;

  const NAME = 'Token';
  const SYMBOL = 'TKN';
  const INIT_SUPPLY = 10 ** 9;

  beforeEach(async function () {
    [dev, reserve] = await ethers.getSigners();
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(reserve.address, INIT_SUPPLY);
    await token.deployed();
  });

  describe('Deployment', async function () {
    it(`Should have name ${NAME}`, async function () {
      expect(await token.name()).to.equal(NAME);
    });
    it(`Should have symbol ${SYMBOL}`, async function () {
      expect(await token.symbol()).to.equal(SYMBOL);
    });
    it(`Should have reserve set`, async function () {
      expect(await token.reserve()).to.equal(reserve.address);
    });
    it(`Should have total supply ${INIT_SUPPLY.toString()}`, async function () {
      expect(await token.totalSupply()).to.equal(INIT_SUPPLY);
    });
    it(`Should mint initial supply ${INIT_SUPPLY.toString()} to reserve`, async function () {
      expect(await token.balanceOf(reserve.address)).to.equal(INIT_SUPPLY);
    });
  });
});
