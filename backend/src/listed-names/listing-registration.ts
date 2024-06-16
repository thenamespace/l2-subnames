import { Injectable } from '@nestjs/common';
import { Network } from 'src/dto/types';
import { getContracts } from 'src/web3/contracts/contract-addresses';
import { RpcClient } from 'src/web3/rpc-client';
import { Hash } from 'viem';

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
    network: Network,
    chainId: number,
  ): Promise<Hash> {
    const verifyingContract = getContracts(network).factory;
    const domain = {
      name: 'Namespace',
      version: '1',
      chainId,
      verifyingContract,
    };

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
      baseUri: context.baseUri,
    };

    return await this.rpcClient.getSigner().signTypedData({
      domain,
      types,
      message,
      primaryType: 'RegistryContext',
    });
  }
}
