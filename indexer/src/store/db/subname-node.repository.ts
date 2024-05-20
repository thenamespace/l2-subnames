import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { SUBNAME_NODE_DOMAIN, SubnameNodeDocument } from "./subname-node.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class SubnameNodeRepository {

    @InjectModel(SUBNAME_NODE_DOMAIN)
    private dao: Model<SubnameNodeDocument>

    public async create(doc: Partial<SubnameNodeDocument>) {
        await this.dao.create(doc);
    }

    public async getByNode(node: string) {
        return await this.dao.findOne({node});
    }

    public async updateTexts(node: string, texts: Record<string,string>) {
        await this.dao.findOneAndUpdate({node}, {texts});
    }

    public async updateAddresses(node: string, addresses: Record<string,string>) {
        await this.dao.findOneAndUpdate({node}, {addresses});
    }

    public async updateContentHash(node: string, contentHash:string) {
        await this.dao.findOneAndUpdate({node}, {contentHash});
    }
}