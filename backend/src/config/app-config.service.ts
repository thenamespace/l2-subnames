import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, Hash } from 'viem';
import { base, baseSepolia, localhost, sepolia } from 'viem/chains';

const chains = {
  sepolia,
  localhost,
  base,
  baseSepolia,
};

@Injectable()
export class AppConfig {
  public mongoConnectionString: string;
  public baseRpc: string;
  public sepoliaRpc: string;
  public mainnetRpc: string;
  public signerKey: Hash;
  public appSignerName: string;
  public appSignerVersion: string;
  public namesApiUrl: string;
  public metadataUrl: string;
  public nameWrapperAddress: Address;
  public ensRegistryAddress: Address;

  constructor(private readonly configService: ConfigService) {
    this.mongoConnectionString = this.configService.getOrThrow(
      'MONGO_CONNECTION_STRING',
    );
    this.baseRpc = this.configService.get('BASE_RPC');
    this.sepoliaRpc = chains[this.configService.get('SEPOLIA_RPC')];
    this.mainnetRpc = chains[this.configService.get('MAINNET_RPC')];
    this.signerKey = this.configService.getOrThrow('SIGNER_KEY');
    this.appSignerName = this.configService.getOrThrow('APP_SIGNER_NAME');
    this.appSignerVersion = this.configService.getOrThrow('APP_SIGNER_VERSION');
    this.namesApiUrl = this.configService.getOrThrow('NAMES_API_URL');
    this.metadataUrl = this.configService.getOrThrow('METADATA_URL');
    this.nameWrapperAddress = this.configService.getOrThrow(
      'NAME_WRAPPER_ADDRESS',
    );
    this.ensRegistryAddress = this.configService.getOrThrow(
      'ENS_REGISTRY_ADDRESS',
    );
  }
}
