import { Address } from "viem";
import { useAccount } from "wagmi";

interface ContractAddresses {
  nameRegistryController: Address;
}

const addresses: Record<string, ContractAddresses> = {
  "11155111": {
    nameRegistryController: "0xB3f2eA0fA4Ec33A2fDC0854780BBe2696Dd388E0",
  },
};

export const useGetAddresses = () => {
  const { chain } = useAccount();

  const chainId = chain?.id || 1;
  const chainIdStr = chainId.toString() as string;

  return addresses[chainIdStr];
};
