/* eslint-disable prettier/prettier */
import { Address } from "viem";
import { Network } from "./types";

interface IContractAddresses {
  registry: Address;
  resolver: Address;
}

const addresses: Record<Network, IContractAddresses> = {
  base: {
    registry: "0x0",
    resolver: "0x0",
  },
  sepolia: {
    registry: "0x0",
    resolver: "0x0",
  },
};

export const getContractAddresses = (network: Network) => {
  return addresses[network];
};
