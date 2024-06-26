import { Injectable } from "@nestjs/common";
import { MongoStorageService } from "src/store/mongo-storage.service";
import { ISubnameNode } from "src/store/types";
import { Network } from "src/web3/types";
import { Hash } from "viem";

@Injectable()
export class SubnamesService {
  constructor(private dbService: MongoStorageService) {}

  async getSubname(network: Network, nodeHash: Hash): Promise<ISubnameNode> {
    return await this.dbService.getSubnameNode(network, nodeHash);
  }
}
