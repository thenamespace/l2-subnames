import "@nomicfoundation/hardhat-toolbox-viem";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "./scripts/name-registry";
import "./scripts/name-registry-controller";

dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      forking: {
        url: "https://eth-sepolia.g.alchemy.com/v2/" + process.env.SEPOLIA_KEY,
        blockNumber: 5904049,
      },
      accounts: [
        {
          privateKey: process.env.SIGNER_KEY as string,
          balance: "203109970411045308",
        },
      ],
    },
    sepolia: {
      chainId: 11155111,
      accounts: [process.env.SIGNER_KEY as string],
      url: "https://eth-sepolia.g.alchemy.com/v2/" + process.env.SEPOLIA_KEY,
      gasPrice: 2000000000,
      gas: 10_000_000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};

export default config;
