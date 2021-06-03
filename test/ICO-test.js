/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('All', async function () {
  let Token, token, ICO, ico, dev, reserve, owner, alice, bob;

  const NAME = 'Token';
  const SYMBOL = 'TKN';
  const INIT_SUPPLY = 10 ** 9;
  const WEI = 1;
  const TOKEN_PRICE = 2 * WEI;
  const PAYMENT = 4 * WEI;

  beforeEach(async function () {
    [dev, reserve, owner, alice, bob] = await ethers.getSigners();
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(reserve.address, INIT_SUPPLY);
    await token.deployed();
  });

  describe('Token', async function () {
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

  describe('ICO', async function () {
    beforeEach(async function () {
      ICO = await ethers.getContractFactory('ICO');
      ico = await ICO.connect(dev).deploy(token.address, owner.address, TOKEN_PRICE);
      await ico.deployed();
    });

    describe('Deployment', async function () {
      it(`Should have token address set`, async function () {
        expect(await ico.token()).to.equal(token.address);
      });
      it(`Should have reserve set`, async function () {
        expect(await ico.reserve()).to.equal(await token.reserve());
      });
      it(`Should have owner set`, async function () {
        expect(await ico.owner()).to.equal(owner.address);
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
      it('Should revert if owner', async function () {
        await expect(ico.connect(owner).buyTokens()).to.be.revertedWith('ICO : owner can not use this function');
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
        await expect(ico.connect(owner).withdraw()).to.be.revertedWith('ICO : sales is not over');
      });
      it('Should revert if ICO is empty', async function () {
        await ethers.provider.send('evm_increaseTime', [1209600]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdraw()).to.be.revertedWith('ICO : you can not withdraw empty balance');
      });
      it('Should change balances', async function () {
        await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
        await ethers.provider.send('evm_increaseTime', [1209600]);
        await ethers.provider.send('evm_mine');
        tx = await ico.connect(owner).withdraw();
        expect(tx).to.changeEtherBalance(owner, +PAYMENT);
      });
      it('Emits Withdrawed event', async function () {
        await ico.connect(alice).buyTokens({ value: PAYMENT, gasPrice: 0 });
        await ethers.provider.send('evm_increaseTime', [1209600]);
        await ethers.provider.send('evm_mine');
        await expect(ico.connect(owner).withdraw()).to.emit(ico, 'Withdrawed').withArgs(owner.address, PAYMENT);
      });
    });
  });
});

/* 

MODIFIER
it('Should revert if owner', async function () {
  await expect(function).to.be.revertedWith("ICO : owner can not use this function")
})
it('Should revert if sales is off', async function () {
  await ethers.provider.send('evm_increaseTime', [3600]);
  await ethers.provider.send('evm_mine');
  await expect(function).to.be.revertedWith("ICO : sales is not open")
})
it('Should revert if sales is not over', async function () {
  await expect(function).to.be.revertedWith("ICO : sales is not over")
})

EVENT
it('Emits Bought event', async function () {
  await expect(function).to.emit(ico, 'Bought').withArgs(address, amount)
})
it('Emits Withdrawed event', async function () {
  await expect(function).to.emit(ico, 'Withdrawed').withArgs(address, amount)
})

TEST DANS LE TEMPS (1h)
await ethers.provider.send('evm_increaseTime', [3600]);
await ethers.provider.send('evm_mine');

*/
