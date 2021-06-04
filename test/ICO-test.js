/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ICO', async function () {
  let Token, token, ICO, ico, dev, reserve, ownerICO, alice, bob;

  const INIT_SUPPLY = 10 ** 9;
  const WEI = 1;
  const TOKEN_PRICE = 2 * WEI;
  const PAYMENT = 4 * WEI;

  beforeEach(async function () {
    [dev, reserve, ownerICO, alice, bob] = await ethers.getSigners();
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(reserve.address, INIT_SUPPLY);
    await token.deployed();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(dev).deploy(token.address, ownerICO.address, TOKEN_PRICE);
    await ico.deployed();
  });

  describe('Deployment', async function () {
    it(`Should have token address set`, async function () {
      expect(await ico.token()).to.equal(token.address);
    });
    it(`Should have reserve set`, async function () {
      expect(await ico.reserve()).to.equal(await token.reserve());
    });
    it(`Should have ownerICO set`, async function () {
      expect(await ico.owner()).to.equal(ownerICO.address);
    });
    it(`Should have tokenPrice ${TOKEN_PRICE}`, async function () {
      expect(await ico.tokenPrice()).to.equal(TOKEN_PRICE);
    });
  });

  describe('receive', async function () {
    it('direct transfer', async function () {
      await token.connect(reserve).approve(ico.address, INIT_SUPPLY);
      expect(await alice.sendTransaction({ to: ico.address, value: PAYMENT, gasPrice: 0 })).to.changeEtherBalance(
        ico,
        PAYMENT
      );
    });
  });

  describe('buyTokens', async function () {
    beforeEach(async function () {
      await token.connect(reserve).approve(ico.address, INIT_SUPPLY);
    });
    it('Should revert if ownerICO', async function () {
      await expect(ico.connect(ownerICO).buyTokens()).to.be.revertedWith('ICO : owner can not use this function');
    });
    it('Should revert if sales is off', async function () {
      await ethers.provider.send('evm_increaseTime', [1209600]);
      await ethers.provider.send('evm_mine');
      await expect(ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 })).to.be.revertedWith(
        'ICO : sales is not open'
      );
    });
    it('Should revert if msg.value = 0', async function () {
      await expect(ico.connect(alice).buyTokens()).to.be.revertedWith('ICO : you have to pay to get tokens');
    });
    it('Should revert if not enought in reserve', async function () {
      await expect(
        ico.connect(alice).buyTokens({ value: 10 + INIT_SUPPLY * TOKEN_PRICE, gasPrice: 0 })
      ).to.be.revertedWith('ICO : do not have enought tokens to sell');
    });
    it('Should increase nbTokenSold', async function () {
      await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
      await ico.connect(bob).buyTokens({ value: PAYMENT, gasPrice: 0 });
      expect(await ico.nbTokenSold()).to.equal((2 * PAYMENT) / TOKEN_PRICE);
    });
    it('Should change balances', async function () {
      tx = await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
      expect(await token.balanceOf(alice.address)).to.equal(PAYMENT / TOKEN_PRICE);
      expect(await ico.gain()).to.equal(PAYMENT);
      expect(tx).to.changeEtherBalance(alice, -PAYMENT);
    });
    it('Emits Bought event', async function () {
      await expect(ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 }))
        .to.emit(ico, 'Bought')
        .withArgs(alice.address, PAYMENT / TOKEN_PRICE);
    });
  });

  describe('withdraw', async function () {
    beforeEach(async function () {
      await token.connect(reserve).approve(ico.address, INIT_SUPPLY);
    });
    it('Should revert if sales is not over', async function () {
      await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
      await expect(ico.connect(ownerICO).withdraw()).to.be.revertedWith('ICO : sales is not over');
    });
    it('Should revert if ICO is empty', async function () {
      await ethers.provider.send('evm_increaseTime', [1209600]);
      await ethers.provider.send('evm_mine');
      await expect(ico.connect(ownerICO).withdraw()).to.be.revertedWith('ICO : you can not withdraw empty balance');
    });
    it('Should change balances', async function () {
      await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
      await ethers.provider.send('evm_increaseTime', [1209600]);
      await ethers.provider.send('evm_mine');
      tx = await ico.connect(ownerICO).withdraw();
      expect(tx).to.changeEtherBalance(ownerICO, +PAYMENT);
    });
    it('Emits Withdrawed event', async function () {
      await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
      await ethers.provider.send('evm_increaseTime', [1209600]);
      await ethers.provider.send('evm_mine');
      await expect(ico.connect(ownerICO).withdraw()).to.emit(ico, 'Withdrawed').withArgs(ownerICO.address, PAYMENT);
    });
  });
});
