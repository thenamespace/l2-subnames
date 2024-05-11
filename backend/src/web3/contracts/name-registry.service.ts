import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config';
import { Network } from 'src/types';
import abi from 'src/web3/abi/name-registry.json';
import { Address, namehash, zeroAddress } from 'viem';
import { getContracts } from './contract-addresses';
import { RpcClient } from '../rpc-client';

@Injectable()
export class NameRegistryService {
  readonly address: Address;

  constructor(
    private rpc: RpcClient,
    private config: AppConfig,
  ) {
    this.address = getContracts(this.config.l2Chain.name as Network).registry;
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
