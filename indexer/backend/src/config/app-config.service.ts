import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Hash } from 'viem';
import { Chain, base, baseSepolia, localhost, sepolia } from 'viem/chains';

const chains = {
  sepolia,
  localhost,
  base,
  baseSepolia,
};

@Injectable()
export class AppConfig {
  public l2Rpc: string;
  public l2Chain: Chain;
  public signerKey: Hash;
  public appSignerName: string;
  public appSignerVersion: string;

  constructor(private readonly configService: ConfigService) {
    this.l2Rpc = this.configService.get('L2_RPC_URL');
    this.l2Chain = chains[this.configService.get('L2_CHAIN')];
    this.signerKey = this.configService.get('SIGNER_KEY');
    this.appSignerName = this.configService.get('APP_SIGNER_NAME');
    this.appSignerVersion = this.configService.get('APP_SIGNER_VERSION');
  }
}
