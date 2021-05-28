/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');

describe('ICO', async function () {
  let ICO, ico, dev, owner

  const NAME = 'ICO';
  const SYMBOL = 'ICO';
  const INIT_SUPPLY = ethers.utils.parseEther('1000000');
  const TOKEN_PRICE = 1000000000;

  beforeEach(async function () {
    [dev, owner] = await ethers.getSigners();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(dev).deploy(owner.address, INIT_SUPPLY, TOKEN_PRICE);
    await ico.deployed();
  });

  describe('Deployment', async function () {
    it(`Should have name ${NAME}`, async function () {
      expect(await ico.name()).to.equal(NAME);
    });
    it(`Should have symbol ${SYMBOL}`, async function () {
      expect(await ico.symbol()).to.equal(SYMBOL);
    });
    it(`Should have owner set`, async function () {
      expect(await ico.owner()).to.equal(owner.address);
    });
    it(`Should have tokenPrice ${TOKEN_PRICE}`, async function () {
      expect(await ico.tokenPrice()).to.equal(TOKEN_PRICE);
    });
    it(`Should have total supply ${INIT_SUPPLY.toString()}`, async function () {
      expect(await ico.totalSupply()).to.equal(INIT_SUPPLY);
    });
    it(`Should mint initial supply ${INIT_SUPPLY.toString()} to owner`, async function () {
     expect(await ico.balanceOf(owner.address)).to.equal(INIT_SUPPLY);
    });
  });

  describe('receive', async function () {

  });

  describe('buyTokens', async function () {

  });

  describe('withdraw', async function () {

  });
  

});

/* MODIFIER
it('Should revert if not owner', async function () {
  await expect(function).to.be.revertedWith("ICO : owner can not use this function")
})
it('Should revert if contract not open', async function () {
  await expect(function).to.be.revertedWith("ICO : contract is not open")
})
it('Should revert if contract closed', async function () {
  await expect(function).to.be.revertedWith("ICO : contract is not closed")
})

it('Should revert if not enought payment', async function () {
  await expect(function).to.be.revertedWith("ICO : you have to pay to get tokens")
})
*/

/* EVENT
it('Emits Bought event', async function () {
      await expect(function).to.emit(ico, 'Bought').withArgs(address, amount)
})
it('Emits Withdrawed event', async function () {
      await expect(function).to.emit(ico, 'Withdrawed').withArgs(address, amount)
})
*/

/* TEST DANS LE TEMPS (1h)
await ethers.provider.send('evm_increaseTime', [3600]);
await ethers.provider.send('evm_mine');
*/
