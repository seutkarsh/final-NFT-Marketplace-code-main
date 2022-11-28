require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [
        "b85c4e6f477df9acca86a5bb956e7c271a043aaa07cdb433d7085198f3ba980c",
      ],
    },
  },
};
