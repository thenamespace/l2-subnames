import { Injectable, NotFoundException } from "@nestjs/common";
import { IStorageService, ISubnameNode } from "./types";
import { SubnameNodeRepository } from "./db/subname-node.repository";
import { SubnameNodeDocument } from "./db/subname-node.schema";

@Injectable()
export class MongoStorageService implements IStorageService {
    
    constructor(private readonly repository: SubnameNodeRepository) {}

    async setText(node: string, key: string, record: string) {

        const subname = await this._getSubnameNode(node);
        const texts = subname.texts || {};
        texts[key] = record;

        await this.repository.updateTexts(node, texts);
    }
    async setAddr(node: string, coinType: string, address: string) {
        const subname = await this._getSubnameNode(node);
        const texts = subname.addresses || {};
        texts[coinType] = address;

        await this.repository.updateAddresses(node, texts);
    }
    async setContentHash(node: string, contentHash: string) {
        await this.repository.updateContentHash(node, contentHash);
    }

    async getSubnameNode(node: string): Promise<ISubnameNode> {
        const doc = await this._getSubnameNode(node);
        return this.toResponse(doc);
    };
   
    async createSubnameNode(node: ISubnameNode) {
        await this.repository.create({
            owner: node.owner,
            label: node.label,
            parentNode: node.parentNode,
            node: node.subnameNode,
            texts: node.texts || {},
            addresses: node.addresses || {},
            contentHash: node.contentHash,
            expiry: node.expiry,
            createdAt: new Date().getTime()
        })
    }

    private async _getSubnameNode(node: string) {
       const doc = await this.repository.getByNode(node);
       if (!doc) {
        throw new NotFoundException("Subname with node " + node + ", not found.")
       }
       return doc;
    }

    private toResponse(doc: SubnameNodeDocument): ISubnameNode {
        return {
            expiry: doc.expiry,
            label: doc.label,
            owner: doc.owner,
            parentNode: doc.parentNode,
            subnameNode: doc.node,
            texts: doc.texts,
            addresses: doc.addresses,
            contentHash: doc.contentHash
        }
    }
    
}