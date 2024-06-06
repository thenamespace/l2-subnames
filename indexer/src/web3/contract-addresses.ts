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
    registry: "0x03986BCa608e2c7b638A7E68C7108C5c5Ae2Cd3E",
    resolver: "0xFa47f74919Fe432B7e4dB77D4ff05637729D7632",
    controller: "0xD4CDFC67d30320F0d063E388Fab204c6692d797f",
  },
};

export const getContractAddresses = (network: Network) => {
  return addresses[network];
};
