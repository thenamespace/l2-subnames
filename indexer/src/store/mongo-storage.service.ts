import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { AppConfiguration } from "src/configuration/app-configuration";
import { Network } from "src/web3/types";
import { Address, Hash } from "viem";
import { SubnameNodeRepository } from "./db/subname-node.repository";
import { SubnameNode } from "./db/subname-node.schema";
import { IStorageService, ISubnameNode } from "./types";

@Injectable()
export class MongoStorageService
  implements IStorageService, OnApplicationBootstrap
{
  constructor(
    private readonly repository: SubnameNodeRepository,
    private readonly config: AppConfiguration,
  ) {}

  async onApplicationBootstrap() {
    try {
      for (const chain of this.config.supportedChains) {
        await this.initNode(chain as Network);
      }
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

  async setText(network: Network, node: Hash, key: string, record: string) {
    const texts = {};
    texts[key] = record;

    await this.repository.updateTexts(network, node, texts);
  }
  async setAddr(
    network: Network,
    node: Hash,
    coinType: string,
    address: Address,
  ) {
    const addresses = {};
    addresses[coinType] = address;

    await this.repository.updateAddresses(network, node, addresses);
  }
  async setContentHash(network: Network, node: Hash, contentHash: Hash) {
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
      texts: node.textRecords || {},
      addresses: node.addresses || {},
      contentHash: node.contentHash,
      createdAt: new Date().getTime(),
      expiry: node.expiry,
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
      textRecords: doc.texts,
      addresses: doc.addresses,
      contentHash: doc.contentHash,
      expiry: doc.expiry,
    };
  }
}
