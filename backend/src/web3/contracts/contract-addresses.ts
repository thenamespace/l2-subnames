import { Address } from 'viem';
import { Network } from '../../dto/types';

interface NamespaceContracts {
  resolver: Address;
  registry: Address;
  controller: Address;
  factory: Address;
}

const contracts: Record<Network, NamespaceContracts> = {
  base: {
    registry: '0x7014a57DCC7E1acf03aEE7E2f642AA5BA3359798',
    resolver: '0xeFCC3a6459D9fc52DF09deAc45fA18472C37226c',
    controller: '0x7535c805055a3452ef692986f76E57dbabA0810f',
    factory: '0x',
  },
  sepolia: {
    registry: '0xcc230502499E76bB8ec26F04235587Ee154Ef415',
    resolver: '0x0385E115c0D092Fc3D95eC56379BFDae8365c028',
    controller: '0x6457FA238F5A41c0461801ad5417F32514E4F75f',
    factory: '0x03fAbeF7180918ded465025DAdAf1c48B2d8C647',
  },
  localhost: {
    registry: '0x4fEfb2D4c6483777290F6e7e1957e36297F1124A',
    resolver: '0x23D1d9Bb060B45289D66C3E259f8Cd2e14931E5a',
    controller: '0xc2F5D5B979A1AEAde58A9E6b5498753FE2f4829c',
    factory: '0xB5BB2Ed7893F868D8c2b72154d06b32deC52c21d',
  },
  arbitrum: {
    registry: '0x0',
    resolver: '0x0',
    controller: '0x0',
    factory: '0x',
  },
  optimism: {
    registry: '0x0',
    resolver: '0x0',
    controller: '0x0',
    factory: '0x',
  },
  mainnet: undefined,
};

export const getContracts = (network: Network) => {
  return contracts[network];
};
