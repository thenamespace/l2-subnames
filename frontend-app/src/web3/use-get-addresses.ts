import { Address } from "viem";
import { Web3Network } from "./types";
import { useWeb3Network } from "./use-web3-network";

interface ContractAddresses {
  nameRegistryController: Address;
  nameRegistry: Address;
  nameRegistryFactory: Address;
}

const addresses: Record<Web3Network, ContractAddresses> = {
  sepolia: {
    nameRegistryController: "0xCC475c57fe48bdACC5Fc8b3734a47d78d6aceD86",
    nameRegistry: "0x",
    nameRegistryFactory: "0xDb24Eff63211401F169CBdE35471987f4128E97b",
  },
  baseSepolia: {
    nameRegistry: "0x7014a57DCC7E1acf03aEE7E2f642AA5BA3359798",
    nameRegistryController: "0x782A5e454C36E6a79cbd96a54Ae6F82d522a498c",
    nameRegistryFactory: "0x350fEf5CFAe878CD51B6f0eFd301410e0D265D99",
  },
  base: {
    nameRegistryController: "0x7535c805055a3452ef692986f76E57dbabA0810f",
    nameRegistry: "0x7014a57DCC7E1acf03aEE7E2f642AA5BA3359798",
    nameRegistryFactory: "0x",
  },
  arbitrum: {
    nameRegistry: "0x0",
    nameRegistryController: "0x0",
    nameRegistryFactory: "0x",
  },
  optimism: {
    nameRegistry: "0x0",
    nameRegistryController: "0x0",
    nameRegistryFactory: "0x",
  },
  localhost: {
    nameRegistryController: "0x90Ffc4e37E1C1a88F4d3F5b082769F1E1EB1ff42",
    nameRegistry: "0xD4CDFC67d30320F0d063E388Fab204c6692d797f",
    nameRegistryFactory: "0x29a5EA2b300d6c886b20229B9e663d68fcE2e3a5",
  },
};

export const useGetAddresses = () => {
  const { networkName } = useWeb3Network();

  return addresses[networkName];
};
