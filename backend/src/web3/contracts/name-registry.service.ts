import { Injectable } from '@nestjs/common';
import REGISTRY_ABI from '../abi/name-registry.json';
import { namehash, zeroAddress } from 'viem';
import { RpcClient } from '../rpc-client';
import { getContracts } from './contract-addresses';
import { Network } from 'src/dto/types';

@Injectable()
export class NameRegistryService {

  constructor(
    private rpc: RpcClient,
  ) {}

  public async isSubnameTaken(network: Network,subname: string) {
    
    const nameRegistryAddr = getContracts(network).registry;
    const publicClient = this.rpc.getPublicClient(network);

    const owner = await publicClient.readContract({
      address: nameRegistryAddr,
      abi: REGISTRY_ABI,
      functionName: 'ownerOf',
      args: [BigInt(namehash(subname))],
    });

    return owner !== zeroAddress;
  }
}
