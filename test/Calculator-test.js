/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Calculator', async function () {
  let Token, token, Calculator, calculator, dev, reserve, ownerCalc, alice, bob;

  const INIT_SUPPLY = 10 ** 9;
  const PRICE = 1;

  beforeEach(async function () {
    [dev, reserve, ownerCalc, alice, bob] = await ethers.getSigners();
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(reserve.address, INIT_SUPPLY);
    await token.deployed();
    await token.connect(reserve).transfer(alice.address, INIT_SUPPLY);
    Calculator = await ethers.getContractFactory('Calculator');
    calculator = await Calculator.connect(dev).deploy(token.address, ownerCalc.address);
    await calculator.deployed();
  });

  describe('Deployment', async function () {
    it(`Should have token address set`, async function () {
      expect(await calculator.token()).to.equal(token.address);
    });
    it(`Should have ownerCalc set`, async function () {
      expect(await calculator.owner()).to.equal(ownerCalc.address);
    });
  });

  describe('Calcul functions', async function () {
    beforeEach(async function () {
      await token.connect(alice).approve(calculator.address, INIT_SUPPLY);
    });
    describe('add', async function () {
      it('Should revert if not enought TKN', async function () {
        await expect(calculator.connect(bob).add(10, 5)).to.be.revertedWith('Calculator : operation cost 1 TKN');
      });
      it('Should trade TKN', async function () {
        balanceUserBefore = await token.balanceOf(alice.address);
        balanceCalcBefore = await token.balanceOf(calculator.address);
        await calculator.connect(alice).add(10, 5);
        balanceUserAfter = await token.balanceOf(alice.address);
        balanceCalcAfter = await token.balanceOf(calculator.address);
        expect(balanceUserAfter, 'user').to.equal(balanceUserBefore - PRICE);
        expect(balanceCalcAfter, 'calc').to.equal(balanceCalcBefore + PRICE);
      });
      it('Emits Bought event', async function () {
        await expect(calculator.connect(alice).add(10, 5)).to.emit(calculator, 'Bought').withArgs(alice.address, 1);
      });
      it('Emits Added event', async function () {
        await expect(calculator.connect(alice).add(10, 5)).to.emit(calculator, 'Added').withArgs(10, 5, 15);
      });
    });
    describe('sub', async function () {
      it('Should revert if not enought TKN', async function () {
        await expect(calculator.connect(bob).sub(10, 5)).to.be.revertedWith('Calculator : operation cost 1 TKN');
      });
      it('Should trade TKN', async function () {
        balanceUserBefore = await token.balanceOf(alice.address);
        balanceCalcBefore = await token.balanceOf(calculator.address);
        await calculator.connect(alice).sub(10, 5);
        balanceUserAfter = await token.balanceOf(alice.address);
        balanceCalcAfter = await token.balanceOf(calculator.address);
        expect(balanceUserAfter, 'user').to.equal(balanceUserBefore - PRICE);
        expect(balanceCalcAfter, 'calc').to.equal(balanceCalcBefore + PRICE);
      });
      it('Emits Bought event', async function () {
        await expect(calculator.connect(alice).sub(10, 5)).to.emit(calculator, 'Bought').withArgs(alice.address, 1);
      });
      it('Emits Substracted event', async function () {
        await expect(calculator.connect(alice).sub(10, 5)).to.emit(calculator, 'Substracted').withArgs(10, 5, 5);
      });
    });
    describe('mul', async function () {
      it('Should revert if not enought TKN', async function () {
        await expect(calculator.connect(bob).mul(10, 5)).to.be.revertedWith('Calculator : operation cost 1 TKN');
      });
      it('Should trade TKN', async function () {
        balanceUserBefore = await token.balanceOf(alice.address);
        balanceCalcBefore = await token.balanceOf(calculator.address);
        await calculator.connect(alice).mul(10, 5);
        balanceUserAfter = await token.balanceOf(alice.address);
        balanceCalcAfter = await token.balanceOf(calculator.address);
        expect(balanceUserAfter, 'user').to.equal(balanceUserBefore - PRICE);
        expect(balanceCalcAfter, 'calc').to.equal(balanceCalcBefore + PRICE);
      });
      it('Emits Bought event', async function () {
        await expect(calculator.connect(alice).mul(10, 5)).to.emit(calculator, 'Bought').withArgs(alice.address, 1);
      });
      it('Emits Multiplied event', async function () {
        await expect(calculator.connect(alice).mul(10, 5)).to.emit(calculator, 'Multiplied').withArgs(10, 5, 50);
      });
    });
    describe('div', async function () {
      it('Should revert if not enought TKN', async function () {
        await expect(calculator.connect(bob).div(10, 5)).to.be.revertedWith('Calculator : operation cost 1 TKN');
      });
      it('Should revert if b = 0', async function () {
        await expect(calculator.connect(alice).div(10, 0)).to.be.revertedWith('Calculator : can not divide by 0');
      });
      it('Should trade TKN', async function () {
        balanceUserBefore = await token.balanceOf(alice.address);
        balanceCalcBefore = await token.balanceOf(calculator.address);
        await calculator.connect(alice).div(10, 5);
        balanceUserAfter = await token.balanceOf(alice.address);
        balanceCalcAfter = await token.balanceOf(calculator.address);
        expect(balanceUserAfter, 'user').to.equal(balanceUserBefore - PRICE);
        expect(balanceCalcAfter, 'calc').to.equal(balanceCalcBefore + PRICE);
      });
      it('Emits Bought event', async function () {
        await expect(calculator.connect(alice).div(10, 5)).to.emit(calculator, 'Bought').withArgs(alice.address, 1);
      });
      it('Emits Divided event', async function () {
        await expect(calculator.connect(alice).div(10, 5)).to.emit(calculator, 'Divided').withArgs(10, 5, 2);
      });
    });
    describe('mod', async function () {
      it('Should revert if not enought TKN', async function () {
        await expect(calculator.connect(bob).mod(10, 5)).to.be.revertedWith('Calculator : operation cost 1 TKN');
      });
      it('Should trade TKN', async function () {
        balanceUserBefore = await token.balanceOf(alice.address);
        balanceCalcBefore = await token.balanceOf(calculator.address);
        await calculator.connect(alice).mod(10, 5);
        balanceUserAfter = await token.balanceOf(alice.address);
        balanceCalcAfter = await token.balanceOf(calculator.address);
        expect(balanceUserAfter, 'user').to.equal(balanceUserBefore - PRICE);
        expect(balanceCalcAfter, 'calc').to.equal(balanceCalcBefore + PRICE);
      });
      it('Emits Bought event', async function () {
        await expect(calculator.connect(alice).mod(10, 5)).to.emit(calculator, 'Bought').withArgs(alice.address, 1);
      });
      it('Emits Modulated event', async function () {
        await expect(calculator.connect(alice).mod(10, 5)).to.emit(calculator, 'Modulated').withArgs(10, 5, 0);
      });
    });
  });
  describe('withdraw', async function () {
    beforeEach(async function () {
      await token.connect(alice).approve(calculator.address, INIT_SUPPLY);
    });
    it('Should revert if empty balance', async function () {
      await expect(calculator.connect(ownerCalc).withdraw()).to.be.revertedWith(
        'Calculator : you can not withdraw empty balance'
      );
    });
    it('Should trade TKN', async function () {
      await calculator.connect(alice).mod(10, 5);
      balanceOwnerBefore = await token.balanceOf(ownerCalc.address);
      balanceCalcBefore = await token.balanceOf(calculator.address);
      await calculator.connect(ownerCalc).withdraw();
      balanceOwnerAfter = await token.balanceOf(ownerCalc.address);
      balanceCalcAfter = await token.balanceOf(calculator.address);
      expect(balanceOwnerAfter, 'owner').to.equal(balanceOwnerBefore + balanceCalcBefore);
      expect(balanceCalcAfter, 'calc').to.equal(0);
    });
    it('Emits Withdrawed event', async function () {
      await calculator.connect(alice).mod(10, 5);
      balanceCalc = await token.balanceOf(calculator.address);
      await expect(calculator.connect(ownerCalc).withdraw())
        .to.emit(calculator, 'Withdrawed')
        .withArgs(ownerCalc.address, balanceCalc);
    });
  });
});
