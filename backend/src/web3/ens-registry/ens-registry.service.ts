import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import { Network } from 'src/dto/types';
import abi from 'src/web3/abi/ens-registry.json';
import { Address, namehash } from 'viem';
import { RpcClient } from '../rpc-client';

@Injectable()
export class EnsRegistryService {
  constructor(
    private rpc: RpcClient,
    private appConfig: AppConfig,
  ) {}

  async getOwner(network: Network, name: string) {
    return await this.rpc.getPublicClient(network).readContract({
      address: this.appConfig.ensRegistryAddress,
      abi,
      functionName: 'owner',
      args: [namehash(name)],
    });
  }

  async getApproval(network: Network, owner: Address, account: Address) {
    return await this.rpc.getPublicClient(network).readContract({
      address: this.appConfig.ensRegistryAddress,
      abi,
      functionName: 'isApprovedForAll',
      args: [owner, account],
    });
  }
}
