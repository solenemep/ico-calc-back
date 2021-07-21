const hre = require('hardhat');
const { deployed } = require('./deployed');
const { getContract } = require('./getContract');

async function main() {
  const [deployer, reserve, owner] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const tokenAddress = await getContract('Token', 'kovan');
  // We get the contract to deploy
  const Calculator = await hre.ethers.getContractFactory('Calculator');
  const calculator = await Calculator.deploy(tokenAddress, owner.address);

  await calculator.deployed();

  await deployed('Calculator', hre.network.name, calculator.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
