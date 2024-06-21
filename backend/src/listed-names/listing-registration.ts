import { Injectable } from '@nestjs/common';
import { Network } from 'src/dto/types';
import { getContracts } from 'src/web3/contracts/contract-addresses';
import { RpcClient } from 'src/web3/rpc-client';
import { Address, Hash } from 'viem';

export type RegistryContext = {
  ensName: string;
  listingName: string;
  symbol: string;
  baseUri: string;
  owner: Address;
  resolver: Address;
  fuse: number;
  listingType: number;
};

@Injectable()
export class ListingRegistration {
  readonly types = {
    RegistryContext: [
      { name: 'listingName', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'ensName', type: 'string' },
      { name: 'baseUri', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'fuse', type: 'uint8' },
      { name: 'listingType', type: 'uint8' },
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

    const message = {
      listingName: context.listingName,
      symbol: context.symbol,
      ensName: context.ensName,
      baseUri: context.baseUri,
      owner: context.owner,
      resolver: context.resolver,
      fuse: context.fuse,
      listingType: context.listingType,
    };

    return await this.rpcClient.getSigner().signTypedData({
      domain,
      types: this.types,
      message,
      primaryType: 'RegistryContext',
    });
  }
}
