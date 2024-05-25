import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AppConfig } from 'src/config/app-config.service';
import { Metadata } from 'src/dto/meta-data.dto';
import { MintedSubname } from 'src/dto/minted-subname';
import { stringToBytes } from 'viem';

@Injectable()
export class MetadataService {
  constructor(private config: AppConfig) {}

  async getMetadata(chain: string, tokenId: string): Promise<Metadata> {
    const nodeHash = stringToBytes(tokenId);
    const resp = await axios.get(
      this.config.namesApiUrl + `/${chain}/${nodeHash}`,
    );
    const subname = resp.data as MintedSubname;

    return {
      description: subname?.textRecords?.['description'],
      image: subname?.textRecords?.['avatar'],
      name: subname?.textRecords?.['name'],
    };
  }
}
