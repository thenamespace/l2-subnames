import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PrivateKeyAccount,
  PublicClient,
  createPublicClient,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { AppConfig } from '../config/app-config.service';
import {
  base as baseChain,
  baseSepolia,
  localhost,
  mainnet,
  sepolia,
} from 'viem/chains';
import { Network } from 'src/dto/types';

export const supportedChains = {
  base: baseChain,
  sepolia,
  localhost,
  baseSepolia,
};

export const chainIds = {
  [supportedChains.base.id]: 'base',
  [supportedChains.baseSepolia.id]: 'baseSepolia',
  [supportedChains.sepolia.id]: 'sepolia',
  [supportedChains.localhost.id]: 'localhost',
};

@Injectable()
export class RpcClient {
  private readonly signer: PrivateKeyAccount;
  private readonly clients: Record<Network, PublicClient> = {
    sepolia: undefined,
    base: undefined,
    baseSepolia: undefined,
    optimism: undefined,
    arbitrum: undefined,
    localhost: undefined,
    mainnet: undefined,
  };

  constructor(private readonly config: AppConfig) {
    const sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: this.config.sepoliaRpc ? http(this.config.sepoliaRpc) : http(),
    });

    const baseClient = createPublicClient({
      chain: baseChain as any,
      transport: this.config.baseRpc ? http(this.config.baseRpc) : http(),
    });

    const baseSepoliaClient = createPublicClient({
      chain: baseSepolia as any,
      transport: this.config.baseRpc ? http(this.config.baseRpc) : http(),
    });

    const mainnetClient = createPublicClient({
      chain: mainnet,
      transport: this.config.mainnetRpc ? http(this.config.mainnetRpc) : http(),
    });

    const localhostClient = createPublicClient({
      chain: localhost,
      transport: this.config.localhostRpc
        ? http(this.config.localhostRpc)
        : http(),
    });

    this.clients['base'] = baseClient as PublicClient;
    this.clients['baseSepolia'] = baseSepoliaClient as PublicClient;
    this.clients['sepolia'] = sepoliaClient as PublicClient;
    this.clients['mainnet'] = mainnetClient as PublicClient;
    this.clients['localhost'] = localhostClient as PublicClient;

    this.signer = privateKeyToAccount(this.config.signerKey);
  }

  public getPublicClient = (network: Network) => {
    return this.clients[network];
  };

  public getSigner = () => {
    return this.signer;
  };

  public getChain = (network: Network) => {
    if (!supportedChains[network]) {
      throw new BadRequestException('Unsupported network ' + network);
    }
    return supportedChains[network];
  };

  public getNetwork(chain: keyof typeof chainIds) {
    return chainIds[chain];
  }
}
