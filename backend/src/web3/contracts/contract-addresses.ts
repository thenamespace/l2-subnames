import { Address } from 'viem';
import { Network } from '../../dto/types';

interface NamespaceContracts {
  resolver: Address;
  registry: Address;
  controller: Address;
}

const contracts: Record<Network, NamespaceContracts> = {
  base: {
    registry: '0xaE04a09CF2c408803AC7718e3dE22ac346a05B58',
    resolver: '0xa4e093F2C9aA2D76Dc4478D324D844a9c6066DA0',
    controller: '0x4b2aA1d4C269c6113Ca396f811F99580111f3A89',
  },
  sepolia: {
    registry: '0xcc230502499E76bB8ec26F04235587Ee154Ef415',
    resolver: '0x0385E115c0D092Fc3D95eC56379BFDae8365c028',
    controller: '0x6457FA238F5A41c0461801ad5417F32514E4F75f',
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
