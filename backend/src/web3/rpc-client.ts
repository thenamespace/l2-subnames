import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PrivateKeyAccount,
  PublicClient,
  createPublicClient,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { AppConfig } from '../config/app-config.service';
import { base as baseChain, sepolia } from 'viem/chains';
import { Network } from 'src/dto/types';

const supportedChains = {
  base: baseChain,
  sepolia
}

@Injectable()
export class RpcClient {
  private readonly signer: PrivateKeyAccount;
  private readonly clients: Record<string,PublicClient> = {}


  constructor(private readonly config: AppConfig) {

    const sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: this.config.sepoliaRpc ? http(this.config.sepoliaRpc) : http()
    })

    const baseClient = createPublicClient({
      chain: baseChain as any,
      transport: this.config.baseRpc ? http(this.config.baseRpc) : http()
    })

    this.clients["base"] = baseClient as PublicClient;
    this.clients["sepolia"] = sepoliaClient as PublicClient;

    this.signer = privateKeyToAccount(this.config.signerKey);
  }

  public getPublicClient = (network: Network) => {
    return this.clients[network];
  }

  public getSigner = () => {
    return this.signer;
  }

  public getChain = (network: Network) => {
    if (!supportedChains[network]) {
      throw new BadRequestException("Unsupported network " + network)
    }
    return supportedChains[network];
  }
}
