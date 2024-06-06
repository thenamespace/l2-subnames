import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import abi from 'src/web3/abi/ens-registry.json';
import { Address, namehash } from 'viem';
import { RpcClient } from '../rpc-client';

@Injectable()
export class EnsRegistryService {
  constructor(
    private rpc: RpcClient,
    private appConfig: AppConfig,
  ) {}

  async getOwner(name: string) {
    return await this.rpc.getPublicClient('mainnet').readContract({
      address: this.appConfig.ensRegistryAddress,
      abi,
      functionName: 'owner',
      args: [namehash(name)],
    });
  }

  async isApprovedForAll(owner: Address, account: Address) {
    return await this.rpc.getPublicClient('mainnet').readContract({
      address: this.appConfig.ensRegistryAddress,
      abi,
      functionName: 'isApprovedForAll',
      args: [owner, account],
    });
  }
}
