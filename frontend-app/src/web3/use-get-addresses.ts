import { Address } from "viem";
import { useAccount } from "wagmi";

interface ContractAddresses {
  nameRegistryController: Address;
}

const addresses: Record<string, ContractAddresses> = {
  "11155111": {
    nameRegistryController: "0x6457FA238F5A41c0461801ad5417F32514E4F75f",
  },
};

export const useGetAddresses = () => {
  const { chain } = useAccount();

  const chainId = chain?.id || 1;
  const chainIdStr = chainId.toString() as string;

  return addresses[chainIdStr];
};
