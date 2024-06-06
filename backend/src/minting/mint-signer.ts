import { Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import { MintContext } from 'src/dto/mint-context.dto';
import { Network } from 'src/dto/types';
import { getContracts } from 'src/web3/contracts/contract-addresses';
import { RpcClient } from 'src/web3/rpc-client';
import { Hash } from 'viem';

@Injectable()
export class MintSigner {
  readonly types = {
    MintContext: [
      { name: 'label', type: 'string' },
      { name: 'parentLabel', type: 'string' },
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
  ) {}

  public async sign(network: Network, params: MintContext): Promise<Hash> {
    const chain = this.rpc.getChain(network);
    const verifyingContract = getContracts(network).controller;

    const domain = {
      name: this.appConfig.appSignerName,
      version: this.appConfig.appSignerVersion,
      chainId: chain.id,
      verifyingContract,
    };

    const message = {
      label: params.label,
      parentLabel: params.parentLabel,
      resolver: params.resolver,
      owner: params.owner,
      price: params.price,
      fee: params.fee,
      expiry: params.expiry,
      paymentReceiver: params.paymentReceiver,
    };

    const signer = this.rpc.getSigner();

    const signature = await signer.signTypedData({
      domain: domain,
      types: this.types,
      message,
      primaryType: 'MintContext',
    });

    return signature;
  }
}
