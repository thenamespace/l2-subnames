import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {

    },
    baseSepolia: {
      chainId: 1,
      accounts: [],
      url: ""
    }
  }
};

export default config;
