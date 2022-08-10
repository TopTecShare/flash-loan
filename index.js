/* eslint-disable no-console */
/* eslint-disable max-len */
// make sure to test your own strategies, do not use this version in production
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY;
// +-Your S.C.s Address:_
const flashLoanerAddress = process.env.FLASH_LOANER;

const { ethers } = require("ethers");

// +-We instantiate the UniSwap and SushiSwap Smart Contracts(UniSwap/SushiSwap A.B.I.s):_
const UniswapV2Pair = require("./src/artifacts/contracts/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json");
const UniswapV2Factory = require("./src/artifacts/contracts/interfaces/IUniswapV2Factory.sol/IUniswapV2Factory.json");

// +-Use your own Infura node in production:_
const provider = new ethers.providers.InfuraProvider(
  /** 'mainnet' */
  "ropsten",
  process.env.INFURA_KEY
);

const wallet = new ethers.Wallet(privateKey, provider);

/** +-With what amount of each Token would you like to carry out the Arbitrage if
 it is convenient to start with one or the other?.RECOMMENDATION:_ At least at the
beginning Do not risk more than € 1000.:_ */
// +-If the Trade Starts with DAI I want to do it with *number* DAI:_
const DAI_AMOUNT = 500;
console.log("DAI Amount:_", DAI_AMOUNT);

const swapFactory_uni = new Array(3);

/**
 * 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac : sushiswap factory address
 * 0xF028F723ED1D0fE01cC59973C49298AA95c57472 : sashimiswap factory address
 * 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f : uniswap factory address
 * swapFactoryAddress_uni[0] : sushiswap Factory Address
 * swapFactoryAddress_uni[1] : sashimiswap Factory Address
 * swapFactoryAddress_uni[2] : uniswap Factory Address
 */
const swapFactoryAddress_uni = [
  "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
  "0xF028F723ED1D0fE01cC59973C49298AA95c57472",
  "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
];

const runBot = async () => {
  /** +-Ethereum MainNet & Ropsten TestNet D.EX.s Factory Addresses:_
  +-UniSwap Factory Address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'(Is the Same in Both MainNet and TestNet).
  +-SushiSwap Factory Address = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'(Is the Same in Both MainNet and TestNet). */
  for (let i = 0; i < 3; i++) {
    swapFactory_uni[i] = new ethers.Contract(
      swapFactoryAddress_uni[i],
      UniswapV2Factory.abi,
      wallet
    );
  }

  /**
  const sashimiswapFactory = new ethers.Contract(
    "0xF028F723ED1D0fE01cC59973C49298AA95c57472",
    UniswapV2Factory.abi,
    wallet
  );
  const uniswapFactory = new ethers.Contract(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    UniswapV2Factory.abi,
    wallet
  );
   */
  // +-Ethereum MainNet Token Addresses:_
  // const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  // const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

  // +-Ethereum Ropsten TestNet Token Addresses:_
  const daiAddress = "0xf80a32a835f79d7787e8a8ee5721d0feafd78108";
  const wethAddress = "0xf70949bc9b52deffcda63b0d15608d601e3a7c49";

  let swapEthDai_uni = new Array(3);

  const loadPairs = async () => {
    for (let i = 0; i < 3; i++) {
      swapEthDai_uni[i] = new ethers.Contract(
        await swapFactory_uni[i].getPair(wethAddress, daiAddress),
        UniswapV2Pair.abi,
        wallet
      );
    }
    /** 
    sushiEthDai = new ethers.Contract(
      await sushiswapFactory.getPair(wethAddress, daiAddress),
      UniswapV2Pair.abi,
      wallet
    );

    sashimiswapEthDai = new ethers.Contract(
      await sashimiswapFactory.getPair(wethAddress, daiAddress),
      UniswapV2Pair.abi,
      wallet
    );
    uniswapEthDai = new ethers.Contract(
      await uniswapFactory.getPair(wethAddress, daiAddress),
      UniswapV2Pair.abi,
      wallet
    );
    */
  };

  await loadPairs();

  /** +-Every block time, we will ask Infura to check the price of ETH and Dai in Uniswap and Sushiswap.
  We’ll then compare those numbers to get the “spread,” or possible profit margin:_ */
  provider.on("block", async (blockNumber) => {
    try {
      console.log(blockNumber);

      const swapReserves_uni = new Array(3);
      for (let i = 0; i < 3; i++) {
        swapReserves_uni[i] = await swapEthDai_uni[i].getReserves();
      }
      /**
       const sushiswapReserves = await sushiEthDai.getReserves();
       const uniswapReserves = await uniswapEthDai.getReserves();
       const sashimiswapReserves = await sashimiswapEthDai.getReserves();
       */

      /** reserveEthSashimi - eth reserve of eth : dai pair in sashimiswap */
      const reserveEth_uni = new Array(3);
      const reserveDai_uni = new Array(3);

      for (let i = 0; i < 3; i++) {
        reserveEth_uni[i] = Number(
          ethers.utils.formatUnits(swapReserves_uni[i][0], 18)
        );
      }

      for (let i = 0; i < 3; i++) {
        reserveDai_uni[i] = Number(
          ethers.utils.formatUnits(swapReserves_uni[i][1], 18)
        );
      }
      /** 
      const reserveEthSashimi = Number(
        ethers.utils.formatUnits(sashimiswapReserves[0], 18)
      );

      const reserveDaiSashimi = Number(
        ethers.utils.formatUnits(sashimiswapReserves[1], 18)
      );

     
      const reserveEthSushi = Number(
        ethers.utils.formatUnits(sushiswapReserves[0], 18)
      );

      const reserveDaiSushi = Number(
        ethers.utils.formatUnits(sushiswapReserves[1], 18)
      );

      const reserveEthUni = Number(
        ethers.utils.formatUnits(uniswapReserves[0], 18)
      );
      const reserveDaiUni = Number(
        ethers.utils.formatUnits(uniswapReserves[1], 18)
      );

      */

      /** Caculate price Eth : Dai in each swap market */

      const price_uni = new Array(3);
      for (let i = 0; i < 3; i++) {
        price_uni[i] = reserveEth_uni[i] / reserveDai_uni[i];
      }

      /** 
      const price_uni[2] = reserveEthUni / reserveDaiUni;
      const price_uni[0] = reserveEthSushi / reserveDaiSushi;
      const priceSashimiswap = reserveEthSashimi / reserveDaiSashimi;
      */
      /** Determine the start point between uniswap and samishiswap */

      /** Determine the start point between uniswap and sushiswap */
      for (let i = 1; i < 3; i++)
        for (let j = 0; j < i; j++) {
          const shouldStartEth = price_uni[i] < price_uni[j];
          /** Check if there is profit except fee : 0.6 is fee */
          const spread =
            Math.abs((price_uni[j] / price_uni[i] - 1) * 100) - 0.6;
          /** +-If the Trade Starts with ETH, It will use ETH worth = DAI_AMOUNT:_
            (If "const DAI_AMOUNT = 1000;", it will use 1000 DAI in ETH):_ */
          const ETH_AMOUNT = DAI_AMOUNT / price_uni[i];
          console.log("ETH Amount:_", ETH_AMOUNT);
          const shouldTrade =
            spread >
            (shouldStartEth ? ETH_AMOUNT : DAI_AMOUNT) /
              Number(
                ethers.utils.formatEther(
                  swapReserves_uni[i][shouldStartEth ? 1 : 0]
                )
              );
          console.log(`UNISWAP PRICE ${price_uni[i]}`);
          console.log(`SUSHISWAP PRICE ${price_uni[j]}`);
          console.log(`PROFITABLE? ${shouldTrade}`);
          console.log(
            `CURRENT SPREAD: ${(price_uni[j] / price_uni[i] - 1) * 100}%`
          );
          console.log(`ABSLUTE SPREAD: ${spread}`);
          if (!shouldTrade) return;

          const gasLimit = await swapEthDai_uni[j].estimateGas.swap(
            !shouldStartEth ? DAI_AMOUNT : 0,
            shouldStartEth ? ETH_AMOUNT : 0,
            flashLoanerAddress,
            ethers.utils.toUtf8Bytes("1")
          );

          const gasPrice = await wallet.getGasPrice();

          const gasCost = Number(
            ethers.utils.formatEther(gasPrice.mul(gasLimit))
          );

          /** +-DeFi transactions like this can be very expensive. There may appear to be a profitable arbitrage,
              but any profit margin may be eaten up by the cost of gas. An important check of our program is to make
              sure our gas costs don’t eat into our spread:_ */
          const shouldSendTx = shouldStartEth
            ? gasCost / ETH_AMOUNT < spread
            : gasCost / (DAI_AMOUNT / price_uni[i]) < spread;

          // don't trade if gasCost is higher than the spread
          if (!shouldSendTx) return;

          const options = {
            gasPrice,
            gasLimit,
          };
          const tx = await swapEthDai_uni[j].swap(
            !shouldStartEth ? DAI_AMOUNT : 0,
            shouldStartEth ? ETH_AMOUNT : 0,
            flashLoanerAddress,
            ethers.utils.toUtf8Bytes("1"),
            options
          );
          console.log("ARBITRAGE EXECUTED! PENDING Transaction TO BE MINED");
          console.log(tx);
          await tx.wait();
          console.log("SUCCESS! Transaction MINED");
        }
    } catch (err) {
      console.error(err);
    }
  });
};

console.log("Bot started!");

runBot();
