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
    registry: '0x6a2daA8287FE83fCf3a748875a0Cf337359B7Af6',
    resolver: '0x2Cc31Cbf9F201c5E3d29bd813D8F876F5B02a677',
    controller: '0xC83C7D5E41BeBb7bA6F1Ba6bc5d890Fe3dcD67EF',
  },
  localhost: {
    registry: '0xa2b2fc588e2b69b781e9ddce8d8671cd9cbbc224',
    resolver: '0x2bbf9da6f36d160e16c661bb9d2a7f31d543e42f',
    controller: '0x446a4765350d19056129a856e2f263d5a95e2b88',
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
