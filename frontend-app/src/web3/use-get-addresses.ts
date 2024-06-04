import { Address } from "viem";
import { Web3Network } from "./types";
import { getChainName, useWeb3Network } from "./use-web3-network";

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
    nameRegistryController: "0x7535c805055a3452ef692986f76E57dbabA0810f",
    nameRegistry: "0x7014a57DCC7E1acf03aEE7E2f642AA5BA3359798"
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

export const useGetAddresses = (chainId?:number) => {
  const { networkName } = useWeb3Network();

  if (chainId) {
    const network = getChainName(chainId);
    return addresses[network];
  }


  return addresses[networkName] || addresses["base"];
};
