import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { Network } from "src/web3/types";
import { Address } from "viem";
import { SubnameNodeRepository } from "./db/subname-node.repository";
import { SubnameNode } from "./db/subname-node.schema";
import { IStorageService, ISubnameNode } from "./types";

@Injectable()
export class MongoStorageService
  implements IStorageService, OnApplicationBootstrap
{
  constructor(private readonly repository: SubnameNodeRepository) {}

  async onApplicationBootstrap() {
    try {
      await this.initNode("localhost");
      await this.initNode("base");
    } catch (error) {
      console.log(error);
    }
  }

  async initNode(network: Network) {
    const node = await this.repository.getByNetwork(network);

    if (!node) {
      await this.repository.createNode(network);
    }
  }

  async setText(network: Network, node: string, key: string, record: string) {
    const subname = await this.getSubnameNode(network, node);
    const texts = subname.texts || {};
    texts[key] = record;

    await this.repository.updateTexts(network, node, texts);
  }
  async setAddr(
    network: Network,
    node: string,
    coinType: string,
    address: Address,
  ) {
    const nodes = await this.getSubnameNode(network, node);
    const addresses = nodes.addresses || {};
    addresses[coinType] = address;

    await this.repository.updateAddresses(network, node, addresses);
  }
  async setContentHash(network: Network, node: string, contentHash: string) {
    await this.repository.updateContentHash(network, node, contentHash);
  }

  async getSubnameNode(network: Network, node: string): Promise<ISubnameNode> {
    const doc = await this._getSubnameNode(network, node);
    return this.toResponse(doc.subnames?.[0]);
  }

  async getSubnameNodes(
    network: Network,
  ): Promise<{ block: bigint; subnames: ISubnameNode[] }> {
    const doc = await this.repository.getByNetwork(network);

    return { block: doc?.syncBlock, subnames: doc?.subnames };
  }

  async setSubnameNode(
    network: Network,
    syncBlock: bigint,
    node: ISubnameNode,
  ) {
    await this.repository.setNode(network, syncBlock, {
      owner: node.owner,
      label: node.label,
      parentNode: node.parentNode,
      node: node.node,
      texts: node.texts || {},
      addresses: node.addresses || {},
      contentHash: node.contentHash,
      createdAt: new Date().getTime(),
    });
  }

  private async _getSubnameNode(network: Network, node: string) {
    const doc = await this.repository.getByNode(network, node);

    if (!doc) {
      throw new NotFoundException("Subname with node " + node + ", not found.");
    }

    return doc;
  }

  private toResponse(doc: SubnameNode): ISubnameNode {
    return {
      label: doc.label,
      owner: doc.owner,
      parentNode: doc.parentNode,
      node: doc.node,
      texts: doc.texts,
      addresses: doc.addresses,
      contentHash: doc.contentHash,
    };
  }
}
