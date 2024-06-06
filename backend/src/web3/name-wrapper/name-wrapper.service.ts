import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import abi from 'src/web3/abi/name-wrapper.json';
import { Address, namehash } from 'viem';
import { RpcClient } from '../rpc-client';

@Injectable()
export class NameWrapperService {
  constructor(
    private rpc: RpcClient,
    private appConfig: AppConfig,
  ) {}

  async canModifyName(name: string, account: Address) {
    return await this.rpc.getPublicClient('mainnet').readContract({
      address: this.appConfig.nameWrapperAddress,
      abi,
      functionName: 'canModifyName',
      args: [namehash(name), account],
    });
  }
}
