/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');

describe('All', async function () {
  let Token, token, ICO, ico, dev, reserve, owner, alice, bob;

  const NAME = 'Token';
  const SYMBOL = 'TKN';
  const INIT_SUPPLY = ethers.utils.parseEther('1000000');
  const TOKEN_PRICE = 1000000000;

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

    describe('startContract', async function () {
      it('Should revert if not owner of tokens', async function () {
        await expect(ico.connect(alice).startContract()).to.be.revertedWith(
          'ICO : only owner of tokens can use this function'
        );
      });
      it(`Should open contract`, async function () {
        await ico.connect(reserve).startContract();
        expect(await ico.isContractClosed()).to.equal(false);
      });
      it(`Should give allowances to ico to transfer from reserve all supply`, async function () {
        await ico.connect(reserve).startContract();
        expect(await token.allowance(ico.address, reserve.address)).to.equal(INIT_SUPPLY);
      });
    });

    describe('receive', async function () {});

    describe('buyTokens', async function () {
      beforeEach(async function () {
        await ico.connect(reserve).startContract();
      });
      it('Should revert if owner', async function () {
        await expect(ico.connect(owner).buyTokens()).to.be.revertedWith('ICO : owner can not use this function');
      });
      it('Should revert if contract not open', async function () {
        await ico.connect(owner).closeContract();
        await expect(ico.connect(alice).buyTokens()).to.be.revertedWith('ICO : contract is not open');
      });
      it('Should revert if msg.value = 0', async function () {
        await expect(ico.connect(alice).buyTokens()).to.be.revertedWith('ICO : you have to pay to get tokens');
      });
      it('Should revert if not enought in reserve', async function () {
        await expect(ico.connect(alice).buyTokens({ value: 100 })).to.be.revertedWith(
          'ICO : do not have enought tokens to sell'
        );
      });
      it('Should increase nbTokenSold', async function () {
        await ico.connect(alice).buyTokens({ value: 100 });
        await ico.connect(bob).buyTokens({ value: 100 });
        expect(await ico.nbTokenSold()).to.equal(200 * TOKEN_PRICE);
      });
      it('Emits Bought event', async function () {
        await expect(ico.connect(alice).buyTokens({ value: 100 }))
          .to.emit(ico, 'Bought')
          .withArgs(alice.address, 100 * TOKEN_PRICE);
      });
    });

    describe('withdraw', async function () {
      beforeEach(async function () {
        await ico.connect(reserve).startContract();
        await ico.connect(alice).buyTokens({ value: 100 });
      });
      it('Should revert if contract not closed', async function () {
        await expect(ico.connect(owner).withdraw()).to.be.revertedWith('ICO : contract is not closed');
      });
      it('Should revert if ICO is empty', async function () {
        await ico.connect(owner).closeContract();
        await expect(ico.connect(owner).withdraw()).to.be.revertedWith('ICO : you can not withdraw empty balance');
      });
      it('Emits Withdrawed event', async function () {
        await ico.connect(owner).closeContract();
        await expect(ico.connect(owner).withdraw())
          .to.emit(ico, 'Withdrawed')
          .withArgs(owner.address, INIT_SUPPLY - 100 * TOKEN_PRICE);
      });
    });

    // En attendant de comprendre comment gérer la fermeture automatique après 2 semaines.
    describe('closeContract', async function () {
      it('Should revert if contract not open', async function () {
        await ico.connect(owner).closeContract();
        await expect(ico.connect(owner).closeContract()).to.be.revertedWith('ICO : contract is not open');
      });
      it('Should set contractClose to true', async function () {
        await ico.connect(owner).closeContract();
        expect(await ico.isContractClosed()).to.equal(true);
      });
    });
  });
});

/* 

MODIFIER
it('Should revert if owner', async function () {
  await expect(function).to.be.revertedWith("ICO : owner can not use this function")
})
it('Should revert if contract not open', async function () {
  await expect(function).to.be.revertedWith("ICO : contract is not open")
})
it('Should revert if contract not closed', async function () {
  await expect(function).to.be.revertedWith("ICO : contract is not closed")
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
