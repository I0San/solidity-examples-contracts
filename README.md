# Solidity-examples-contract

This project contains a collection of sample Solidity smart contracts and tests, designed to demonstrate and test a variety of basic functions, data types, and smart contract patterns. It is intended as a learning and experimentation resource for developers working with Ethereum smart contracts.

## Contents

### Contracts

- **AddressBook**: A simple contact management contract that allows adding, updating, and removing contacts with associated aliases.
- **eStore**: A decentralized store contract that allows users to list and purchase items using ERC20 tokens.
- **TestStoreToken**: A simple ERC20 token contract used for testing the eStore functionality it is deploy along with eStore and anyone can mint their token.
- **SolidityTypeTester**: A contract for testing and demonstrating various Solidity data types, including primitives, arrays, mappings, structs, enums, and error handling.

## Setup

1. Clone the repository
2. Install dependencies:
   ```shell
   npm install
   ```
3. Copy `.env-example` to `.env`:
   ```shell
   cp .env-example .env
   ```
4. Update `.env` with your values:
   - `TESTNET_DEPLOYER_PK`: Your testnet deployment wallet private key
   - `POLYGONSCAN_API_KEY`: Your PolygonScan API key (for contract verification)
   - `BSCSCAN_API_KEY`: Your BSCScan API key (for contract verification)

## Supported Networks

The project is configured to work with the following networks:

- **Polygon Amoy Testnet** (Chain ID: 80002)
  - RPC URL: https://polygon-amoy.drpc.org
  - Explorer: https://testnet-zkevm.polygonscan.com

- **BSC Testnet** (Chain ID: 97)
  - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
  - Explorer: https://testnet.bscscan.com

## Usage

You can use Hardhat to compile, test, and deploy these contracts. Example commands:

```shell
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
REPORT_GAS=true npx hardhat test

# Local Development
# 1. Start a local Hardhat node in a separate terminal:
npx hardhat node

# 2. Deploy all contracts to the local network:
npx hardhat ignition deploy ./ignition/modules/eStore.js --network localhost
npx hardhat ignition deploy ./ignition/modules/AddressBook.js --network localhost
npx hardhat ignition deploy ./ignition/modules/SolidityTypeTester.js --network localhost

# Testnet Deployments
# Deploy to Polygon Amoy Testnet
npx hardhat ignition deploy ./ignition/modules/eStore.js --network polygonAmoy
npx hardhat ignition deploy ./ignition/modules/AddressBook.js --network polygonAmoy
npx hardhat ignition deploy ./ignition/modules/SolidityTypeTester.js --network polygonAmoy

# Deploy to BSC Testnet
npx hardhat ignition deploy ./ignition/modules/eStore.js --network bscTestnet
npx hardhat ignition deploy ./ignition/modules/AddressBook.js --network bscTestnet
npx hardhat ignition deploy ./ignition/modules/SolidityTypeTester.js --network bscTestnet
```