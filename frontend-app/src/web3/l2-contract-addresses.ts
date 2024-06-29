import { Address } from "viem";
import { L2Network } from "./types";

export interface L2ContractAddresses {
  controller: Address;
  resolver: Address;
  manager: Address;
}

export const l2Addresses: Record<L2Network, L2ContractAddresses> = {
  base: {
    controller: '0x38dB2bA2Fc5A6aD13BA931377F938BBDe831D397',
    manager: '0x903Ece28831a1c08D5e50D85626BFC72431930C4',
    resolver: '0x0aBD0a6A1A98D7BD5D9909A3F1d7EE0B74587d70',
  },
};

export const getL2Addresses = (network: L2Network) => {
    return l2Addresses[network];
}