import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import { Hash } from 'viem';
import { signTypedData } from 'viem/accounts';

type RegistryContext = {
  ensName: string;
  listingName: string;
  symbol: string;
  baseUri: string;
};

@Injectable()
export class ListingRegistration {
  readonly types = {
    RegistryContext: [
      { name: 'ensName', type: 'string' },
      { name: 'listingName', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'baseUri', type: 'string' },
    ],
  };

  constructor(private appConfig: AppConfig) {}

  async generateContext(
    ensName: string,
    listingName: string,
    symbol: string,
    baseUri: string,
    chainId: number,
  ): Promise<Hash> {
    const domain = {
      name: 'Namespace',
      version: '1',
      chainId,
    };

    const message: RegistryContext = {
      ensName,
      listingName,
      symbol,
      baseUri,
    };

    return await signTypedData({
      message,
      primaryType: 'RegistryContext',
      domain,
      types: this.types,
      privateKey: this.appConfig.signerKey,
    });
  }
}
