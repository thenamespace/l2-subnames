import { Address } from 'viem';
import { Network } from '../../dto/types';

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
    registry: '0x4fEfb2D4c6483777290F6e7e1957e36297F1124A',
    resolver: '0xF3d81Ced4346e5c101f9e1eB1614B7b64386E5d1',
    controller: '0xB3f2eA0fA4Ec33A2fDC0854780BBe2696Dd388E0',
  },
  localhost: {
    registry: '0x4fEfb2D4c6483777290F6e7e1957e36297F1124A',
    resolver: '0xF3d81Ced4346e5c101f9e1eB1614B7b64386E5d1',
    controller: '0xB3f2eA0fA4Ec33A2fDC0854780BBe2696Dd388E0',
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
