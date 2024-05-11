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

  readonly types = {
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

  constructor(
    private appConfig: AppConfig,
    private rpc: RpcClient,
  ) {
    const chain = this.appConfig.l2Chain;
    const network = chain.name as Network;
    const verifyingContract = getContracts(network).controller;

    this.domain = {
      name: this.appConfig.appSignerName,
      version: this.appConfig.appSignerVersion,
      chainId: chain.id,
      verifyingContract,
    };
  }

  public async sign(params: MintContext): Promise<Hash> {
    const message = {
      label: params.label,
      parentNode: params.parentNode,
      resolver: params.resolver,
      owner: params.owner,
      price: params.price,
      fee: params.fee,
      expiry: params.expiry,
    };

    const signer = this.rpc.l2Signer;
    const signature = await signer.signTypedData({
      domain: this.domain,
      types: this.types,
      message,
      primaryType: 'MintContext',
      account: signer.account,
    });

    return signature;
  }
}
