import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AppConfig } from 'src/config/app-config.service';
import { Metadata } from 'src/dto/meta-data.dto';
import { MintedSubname } from 'src/dto/minted-subname';
import { Hash, namehash, stringToBytes } from 'viem';

@Injectable()
export class MetadataService {
  constructor(private config: AppConfig) {}

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
    const resp = await axios.get(
      `${this.config.namesApiUrl}/${chain}/${nodeHash}`,
    );
    const subname = resp.data as MintedSubname;

    return {
      description: subname?.textRecords?.['description'],
      image: subname?.textRecords?.['avatar'],
      name: subname?.textRecords?.['name'],
    };
  }
}
