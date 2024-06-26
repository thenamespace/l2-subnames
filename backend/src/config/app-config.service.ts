import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, Hash } from 'viem';

@Injectable()
export class AppConfig {
  public mongoConnectionString: string;
  public baseRpc: string;
  public baseSepoliaRpc: string;
  public sepoliaRpc: string;
  public mainnetRpc: string;
  public localhostRpc: string;
  public signerKey: Hash;
  public appSignerName: string;
  public appSignerVersion: string;
  public namesApiUrl: string;
  public metadataUrl: string;
  public nameWrapperAddress: Address;
  public ensRegistryAddress: Address;
  public supportedChains: string[];

  constructor(private readonly configService: ConfigService) {
    this.mongoConnectionString = this.configService.getOrThrow(
      'MONGO_CONNECTION_STRING',
    );
    this.baseRpc = this.configService.get('BASE_RPC');
    this.baseSepoliaRpc = this.configService.get('BASE_SEPOLIA_RPC');
    this.sepoliaRpc = this.configService.get('SEPOLIA_RPC');
    this.mainnetRpc = this.configService.get('MAINNET_RPC');
    this.localhostRpc = this.configService.get('LOCALHOST_RPC');
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

    const chains: string = configService.getOrThrow('SUPPORTED_CHAINS');
    this.supportedChains = chains.split(',');
  }
}
