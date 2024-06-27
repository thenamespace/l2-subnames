import { Address } from "viem";
import { L2Network } from "./types";

export interface L2ContractAddresses {
  controller: Address;
  resolver: Address;
  manager: Address;
}

export const l2Addresses: Record<L2Network, L2ContractAddresses> = {
  base: {
    controller: "0x3E480bD3776b111F23F56e41203b696675180319",
    manager: "0xc23885E5144F3B58B69a71b9B7D044Bf00828D28",
    resolver: "0x8A4697A504467D65cdb913c371d3Ea06eDB1728E",
  },
};

export const getL2Addresses = (network: L2Network) => {
    return l2Addresses[network];
}