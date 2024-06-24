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
  baseSepolia: {
    registry: '0x7014a57DCC7E1acf03aEE7E2f642AA5BA3359798',
    resolver: '0xc57FbFf8C2E5d285f1cF8E62e3fAD2da2ac69B4b',
    controller: '0x782A5e454C36E6a79cbd96a54Ae6F82d522a498c',
    factory: '0x350fEf5CFAe878CD51B6f0eFd301410e0D265D99',
  },
  sepolia: {
    registry: '0x',
    resolver: '0x9C95841c90c781c55Cd1eEceaAcFe756d44d0f8D',
    controller: '0xc170eaff499cC58724139ba5721E414447B9be3d',
    factory: '0xDb24Eff63211401F169CBdE35471987f4128E97b',
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
