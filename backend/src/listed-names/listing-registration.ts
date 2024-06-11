import { Injectable } from '@nestjs/common';
import { RpcClient } from 'src/web3/rpc-client';
import { Address, Hash } from 'viem';

export type RegistryContext = {
  ensName: string;
  listingName: string;
  symbol: string;
  baseUri: string;
};

@Injectable()
export class ListingRegistration {
  readonly types = {
    RegistryContext: [
      { name: 'listingName', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'ensName', type: 'string' },
      { name: 'baseUri', type: 'string' },
    ],
  };

  constructor(private rpcClient: RpcClient) {}

  async generateContext(
    context: RegistryContext,
    chainId: number,
  ): Promise<Hash> {
    const domain = {
      name: 'Namespace',
      version: '1',
      chainId,
      verifyingContract:
        '0x29a5ea2b300d6c886b20229b9e663d68fce2e3a5' as Address,
    };

    console.log(domain);
    console.log(context);

    const types = {
      RegistryContext: [
        { name: 'listingName', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'ensName', type: 'string' },
        { name: 'baseUri', type: 'string' },
      ],
    };

    const message = {
      listingName: context.listingName,
      symbol: context.symbol,
      ensName: context.ensName,
      baseUri: 'http://localhost:3000/api/v0.1.0/metadata/1337/',
    };

    return await this.rpcClient.getSigner().signTypedData({
      domain,
      types,
      message,
      primaryType: 'RegistryContext',
    });
  }
}
