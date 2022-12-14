const { ethers } = require("hardhat");

async function main() {
  // @dev get nodes on ethereum network
  const [deployer] = await ethers.getSigners();

  // log the account's address
  console.log("Deploying contracts with the account:", deployer.address);

  // @dev get the factory address of the contract - FlashLoanArbitrage
  const ArbitrageFlashLoaner = await ethers.getContractFactory(
    "FlashLoanArbitrage"
  );
  const arbitrageFlashLoaner = await ArbitrageFlashLoaner.deploy(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
  );
  //+-(UniSwap and SushiSwap Factories S.C.s Addresses).
  /**+-Ethereum MainNet & Ropsten TestNet D.EX.s Factory Addresses:_
  +-UniSwap Factory Address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'(Is the Same in Both MainNet and TestNet).
  +-SushiSwap Factory Address = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'(Is the Same in Both MainNet and TestNet).*/
  await arbitrageFlashLoaner.deployed();
  console.log(
    "ArbitrageFlashLoaner Contract Address:",
    arbitrageFlashLoaner.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
