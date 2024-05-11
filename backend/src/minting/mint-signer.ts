import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config';
import { MintContext } from 'src/dto/mint-context.dto';
import { Network } from 'src/types';
import { getContracts } from 'src/web3/contracts/contract-addresses';
import { RpcClient } from 'src/web3/rpc-client';
import { Hash } from 'viem';

@Injectable()
export class MintSigner {
  readonly domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Hash;
  };

  constructor(
    private appConfig: AppConfig,
    private rpc: RpcClient,
  ) {
    const chainId = this.appConfig.l2Chain.id;
    const verifyingContract = getContracts(
      this.appConfig.l2Chain.name as Network,
    ).controller;

    this.domain = {
      name: this.appConfig.appSignerName,
      version: this.appConfig.appSignerVersion,
      chainId,
      verifyingContract,
    };
  }

  public async sign(params: MintContext): Promise<Hash> {
    const types: Record<string, any> = {
      MintContext: [
        { name: 'label', type: 'string' },
        { name: 'parentNode', type: 'bytes32' },
        { name: 'resolver', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: 'fee', type: 'uint256' },
        { name: 'expiry', type: 'uint64' },
        { name: 'paymentReceiver', type: 'address' },
      ],
    };

    const message: Record<string, any> = {
      subnameLabel: params.label,
      parentNode: params.parentNode,
      resolver: params.resolver,
      subnameOwner: params.owner,
      mintPrice: params.price,
      mintFee: params.fee,
      expiry: params.expiry,
    };

    const signer = this.rpc.l2Signer;
    const signature = await signer.signTypedData({
      domain: this.domain,
      types,
      message,
      primaryType: 'MintContext',
      account: signer.account,
    });

    return signature;
  }
}
