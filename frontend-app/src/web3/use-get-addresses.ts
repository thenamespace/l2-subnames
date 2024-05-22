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
    nameRegistryController: "0x85a6a146606Ec64033790f2480B60F88544d08d0"
  }
};

export const useGetAddresses = () => {
  const { chain } = useAccount();

  const chainId = chain?.id || 1;
  const chainIdStr = chainId.toString() as string;

  return addresses[chainIdStr];
};
