import { Address } from "viem";
import { useAccount } from "wagmi";

interface ContractAddresses {
  nameRegistryController: Address;
}

const addresses: Record<string, ContractAddresses> = {
  "11155111": {
    nameRegistryController: "0x6457FA238F5A41c0461801ad5417F32514E4F75f",
  },
  "8453": {
    nameRegistryController: "0x4b2aA1d4C269c6113Ca396f811F99580111f3A89"
  }
};

export const useGetAddresses = () => {
  const { chain } = useAccount();

  const chainId = chain?.id || 1;
  const chainIdStr = chainId.toString() as string;

  return addresses[chainIdStr];
};
