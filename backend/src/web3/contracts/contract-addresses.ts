import { Address } from 'viem';
import { Network } from '../../types';

interface NamespaceContracts {
  resolver: Address;
  registry: Address;
  controller: Address;
}

const contracts: Record<Network, NamespaceContracts> = {
  base: {
    registry: '0x0',
    resolver: '0x0',
    controller: '0x0',
  },
  sepolia: {
    registry: '0xCB4b265118f42511F273ae5Ff4CB9D1c59446E15',
    resolver: '0x2793EEEB30aB9adAb2E1Fa0F08F2b27519220B1D',
    controller: '0x0',
  },
  arbitrum: {
    registry: '0x0',
    resolver: '0x0',
    controller: '0x0',
  },
  optimism: {
    registry: '0x0',
    resolver: '0x0',
    controller: '0x0',
  },
};

export const getContracts = (network: Network) => {
  return contracts[network];
};
