import { Injectable } from '@nestjs/common';
import { PublicClient, createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AppConfig } from '../config/app-config.service';

@Injectable()
export class RpcClient {
  readonly l2Client: PublicClient;

  readonly chains = {
    base,
    baseSepolia,
  };

  constructor(private readonly config: AppConfig) {
    this.l2Client = createPublicClient({
      chain: this.chains[this.config.l2Chain],
      transport: http(this.config.l2Rpc),
    }) as unknown as PublicClient;
  }
}
