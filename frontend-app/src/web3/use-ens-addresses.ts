import { Address } from "viem";

interface ContractAddresses {
  ensRegistry: Address;
  nameWrapper: Address;
}

export type EnsSupportedChain = "mainnet" | "sepolia";

const addresses: Record<EnsSupportedChain, ContractAddresses> = {
  mainnet: {
    ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    nameWrapper: "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401",
  },
  sepolia: {
    ensRegistry: "0x",
    nameWrapper: "0x",
  },
};

export function useGetAddresses() {
  return {
    getAddresses: (chain: EnsSupportedChain) => addresses[chain],
  };
}
