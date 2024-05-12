import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config';
import { Network } from 'src/types';
import abi from 'src/web3/abi/name-registry.json';
import { Address, namehash, zeroAddress } from 'viem';
import { RpcClient } from '../rpc-client';
import { getContracts } from './contract-addresses';

@Injectable()
export class NameRegistryService {
  readonly address: Address;

  constructor(
    private rpc: RpcClient,
    private config: AppConfig,
  ) {
    const network = this.config.l2Chain.name as Network;
    this.address = getContracts(network).registry;
  }

  public async isSubnameTaken(subname: string) {
    const owner = await this.rpc.l2Client.readContract({
      address: this.address,
      abi,
      functionName: 'ownerOf',
      args: [BigInt(namehash(subname))],
    });

    return owner !== zeroAddress;
  }
}
