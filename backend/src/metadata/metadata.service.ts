import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AppConfig } from 'src/config/app-config.service';
import { Metadata } from 'src/dto/meta-data.dto';
import { MintedSubname } from 'src/dto/minted-subname.dto';
import { RpcClient, supportedChains } from 'src/web3/rpc-client';
import { Hash, namehash, stringToBytes } from 'viem';

@Injectable()
export class MetadataService {
  constructor(
    private config: AppConfig,
    private rpcClient: RpcClient,
  ) {}

  async getTokenMetadata(chain: string, tokenId: string): Promise<Metadata> {
    const nodeHash = stringToBytes(tokenId).toString();

    return await this.getMetadata(chain, nodeHash as Hash);
  }

  async getLabelMetadata(
    chain: string,
    label: string,
    parentName: string,
  ): Promise<Metadata> {
    const nodeHash = namehash(`${label}.${parentName}`);

    return await this.getMetadata(chain, nodeHash);
  }

  private async getMetadata(chain: string, nodeHash: Hash): Promise<Metadata> {
    const network = this.rpcClient.getNetwork(
      chain as keyof typeof supportedChains,
    );

    const resp = await axios.get(
      `${this.config.namesApiUrl}/${network}/${nodeHash}`,
    );
    const subname = resp.data as MintedSubname;

    return {
      description: subname?.textRecords?.['description'],
      image: subname?.textRecords?.['avatar'],
      name: subname?.textRecords?.['name'],
    };
  }
}
