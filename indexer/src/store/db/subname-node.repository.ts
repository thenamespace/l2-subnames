import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Network } from "src/web3/types";
import {
  SUBNAME_NODES_DOMAIN,
  SubnameNode,
  SubnameNodeDocument,
  SubnameNodes,
} from "./subname-node.schema";

@Injectable()
export class SubnameNodeRepository {
  @InjectModel(SUBNAME_NODES_DOMAIN)
  private dao: Model<SubnameNodeDocument>;

  public async setNode(
    network: Network,
    syncBlock: bigint,
    subname: SubnameNode,
  ) {
    await this.dao.updateOne(
      {
        network,
      },
      { $set: { syncBlock }, $addToSet: { subnames: subname } },
      { upsert: true },
    );
  }

  public async getByNode(
    network: Network,
    node: string,
  ): Promise<SubnameNodes> {
    return await this.dao.findOne({
      network,
      "network.subnames": { $in: [node] },
    });
  }

  public async getByNetwork(network: Network) {
    return await this.dao.findOne({ network });
  }

  public async updateTexts(node: string, texts: Record<string, string>) {
    await this.dao.findOneAndUpdate({ node }, { texts });
  }

  public async updateAddresses(
    node: string,
    addresses: Record<string, string>,
  ) {
    await this.dao.findOneAndUpdate({ node }, { addresses });
  }

  public async updateContentHash(node: string, contentHash: string) {
    await this.dao.findOneAndUpdate({ node }, { contentHash });
  }
}
