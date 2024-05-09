import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {

    },
    sepolia: {
      chainId: 11155111,
      accounts: [process.env.WALLET_KEY as string],
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_KEY
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};

export default config;
