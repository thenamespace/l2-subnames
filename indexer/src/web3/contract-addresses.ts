/* eslint-disable prettier/prettier */
import { Address } from "viem";
import { Network } from "./types";

interface IContractAddresses {
  registry: Address;
  resolver: Address;
  controller: Address;
}

const addresses: Record<Network, IContractAddresses> = {
  base: {
    registry: "0x0",
    resolver: "0x0",
    controller: "0x0",
  },
  sepolia: {
    registry: "0x0",
    resolver: "0x0",
    controller: "0x0",
  },
  localhost: {
    registry: "0x",
    resolver: "0x23D1d9Bb060B45289D66C3E259f8Cd2e14931E5a",
    controller: "0xc2F5D5B979A1AEAde58A9E6b5498753FE2f4829c",
  },
};

export const getContractAddresses = (network: Network) => {
  return addresses[network];
};
