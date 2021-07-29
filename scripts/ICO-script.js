const { ethers } = require('ethers');
const hre = require('hardhat');
const { deployed } = require('./deployed');
const { getContract } = require('./getContract');

const TOKEN_PRICE = 1;

async function main() {
  const [deployer, reserve, owner] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const tokenAddress = await getContract('Token', 'kovan');
  // We get the contract to deploy
  const ICO = await hre.ethers.getContractFactory('ICO');
  const ico = await ICO.deploy(tokenAddress, owner.address, TOKEN_PRICE);

  await ico.deployed();

  await deployed('ICO', hre.network.name, ico.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
