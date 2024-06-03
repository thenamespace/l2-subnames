import { Injectable } from "@nestjs/common";
import { MongoStorageService } from "src/store/mongo-storage.service";
import { ISubnameNode } from "src/store/types";
import { namehash } from "viem";

@Injectable()
export class SubnamesService {
  constructor(private dbService: MongoStorageService) {}

  async getSubname(label: string, parentName: string): Promise<ISubnameNode> {
    const nodeHash = namehash(`${label}.${parentName}`);

    return await this.dbService.getSubnameNode("localhost", nodeHash);
  }
}
