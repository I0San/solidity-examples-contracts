require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-ignition")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC_URL,
      accounts: [process.env.TESTNET_DEPLOYER_PK],
      chainId: 80002,
      blockConfirmations: 1,
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL,
      accounts: [process.env.TESTNET_DEPLOYER_PK],
      chainId: 97,
      blockConfirmations: 1,
    },
    ApertumTestnet: {
      url: process.env.APERTUM_TESTNET_RPC_URL,
      accounts: [process.env.TESTNET_DEPLOYER_PK],
      chainId: 89898,
      blockConfirmations: 1,
    },
    Apertum: {
      url: process.env.APERTUM_RPC_URL,
      accounts: [process.env.TESTNET_DEPLOYER_PK],
      chainId: 2786,
      blockConfirmations: 1,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com",
        },
      },
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
    ],
  },
  ignition: {
    requiredConfirmations: 1,
  },
}
