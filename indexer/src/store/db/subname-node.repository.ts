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

  public async createNode(network: Network) {
    await this.dao.create({ network });
  }

  public async setNode(
    network: Network,
    syncBlock: bigint,
    subname: SubnameNode,
  ) {
    await this.dao.updateOne(
      {
        network,
        "subnames.node": {
          $ne: subname.node,
        },
      },
      { $set: { syncBlock }, $addToSet: { subnames: subname } },
    );
  }

  public async getByNode(
    network: Network,
    node: string,
  ): Promise<SubnameNodes> {
    return await this.dao.findOne(
      {
        network,
        "subnames.node": node,
      },
      {
        "subnames.$": 1,
      },
    );
  }

  public async getByNetwork(network: Network) {
    return await this.dao.findOne({ network });
  }

  public async updateTexts(
    network: Network,
    node: string,
    texts: Record<string, string>,
  ) {
    const textRecords: Record<string, string> = {};

    for (const [key, value] of Object.entries(texts)) {
      textRecords[`textRecords.${key}`] = value;
    }

    await this.dao.findOneAndUpdate(
      {
        network,
        "subnames.node": node,
      },
      {
        $set: textRecords,
      },
    );
  }

  public async updateAddresses(
    network: Network,
    node: string,
    addresses: Record<string, string>,
  ) {
    const addressRecords: Record<string, string> = {};

    for (const [key, value] of Object.entries(addresses)) {
      addressRecords[`addresses.${key}`] = value;
    }

    await this.dao.findOneAndUpdate(
      {
        network,
        "subnames.node": node,
      },
      {
        $set: addressRecords,
      },
    );
  }

  public async updateContentHash(
    network: Network,
    node: string,
    contentHash: string,
  ) {
    await this.dao.findOneAndUpdate(
      { network, "subnames.node": node },
      { contentHash },
    );
  }
}
