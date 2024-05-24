import { Address } from "viem";
import { Web3Network } from "./types";
import { useWeb3Network } from "./use-web3-network";

interface ContractAddresses {
  nameRegistryController: Address;
  nameRegistry: Address
}

const addresses: Record<Web3Network, ContractAddresses> = {
  sepolia: {
    nameRegistryController: "0x6457FA238F5A41c0461801ad5417F32514E4F75f",
    nameRegistry: "0xcc230502499E76bB8ec26F04235587Ee154Ef415"
  },
  base: {
    nameRegistryController: "0x4b2aA1d4C269c6113Ca396f811F99580111f3A89",
    nameRegistry: "0xaE04a09CF2c408803AC7718e3dE22ac346a05B58"
  },
  arbitrum: {
    nameRegistry: "0x0",
    nameRegistryController: "0x0"
  },
  optimism: {
    nameRegistry: "0x0",
    nameRegistryController: "0x0"
  }
};

export const useGetAddresses = () => {
  const { networkName } = useWeb3Network();

  return addresses[networkName];
};
