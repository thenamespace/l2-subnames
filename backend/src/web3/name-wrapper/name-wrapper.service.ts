import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import abi from 'src/web3/abi/name-wrapper.json';
import { Address, namehash } from 'viem';
import { RpcClient } from '../rpc-client';
import { Network } from 'src/dto/types';

@Injectable()
export class NameWrapperService {
  constructor(
    private rpc: RpcClient,
    private appConfig: AppConfig,
  ) {}

  async canModifyName(network: Network, name: string, account: Address) {
    return await this.rpc.getPublicClient(network).readContract({
      address: this.appConfig.nameWrapperAddress,
      abi,
      functionName: 'canModifyName',
      args: [namehash(name), account],
    });
  }
}
