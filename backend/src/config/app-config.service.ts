import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Hash } from 'viem';
import { base, baseSepolia, localhost, sepolia } from 'viem/chains';

const chains = {
  sepolia,
  localhost,
  base,
  baseSepolia,
};

@Injectable()
export class AppConfig {
  public baseRpc: string;
  public sepoliaRpc: string;
  public signerKey: Hash;
  public appSignerName: string;
  public appSignerVersion: string;
  public namesApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseRpc = this.configService.get('BASE_RPC');
    this.sepoliaRpc = chains[this.configService.get('SEPOLIA_RPC')];
    this.signerKey = this.configService.getOrThrow('SIGNER_KEY');
    this.appSignerName = this.configService.getOrThrow('APP_SIGNER_NAME');
    this.appSignerVersion = this.configService.getOrThrow('APP_SIGNER_VERSION');
    this.namesApiUrl = this.configService.getOrThrow('NAMES_API_URL');
  }
}
