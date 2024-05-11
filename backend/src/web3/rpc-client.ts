import { Injectable } from '@nestjs/common';
import {
  PublicClient,
  WalletClient,
  createPublicClient,
  createWalletClient,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { AppConfig } from '../config/app-config.service';

@Injectable()
export class RpcClient {
  readonly l2Client: PublicClient;
  readonly l2Signer: WalletClient;

  constructor(private readonly config: AppConfig) {
    this.l2Client = createPublicClient({
      chain: this.config.l2Chain,
      transport: http(this.config.l2Rpc),
    }) as unknown as PublicClient;

    this.l2Signer = createWalletClient({
      chain: this.config.l2Chain,
      transport: http(this.config.l2Rpc),
      account: privateKeyToAccount(this.config.signerKey),
    });
  }
}
