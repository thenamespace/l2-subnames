import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({_id: false, collection: "subname-nodes"})
class SubnameNode {
    @Prop({required: true, type: String})
    label: string

    @Prop({required: true, type: String})
    parentNode: string

    @Prop({required: true, type: String, unique: true})
    node: string

    @Prop({required: true, type: String})
    owner: string

    @Prop({required: true, type: Number})
    expiry: number

    @Prop({required: false, type: Object})
    addresses: Record<string,string>

    @Prop({required: false, type: Object})
    texts: Record<string,string>

    @Prop({required:false, type: String})
    contentHash: string

    @Prop({required: true, type: Number})
    createdAt: number
}

export const SubnameNodeSchema = SchemaFactory.createForClass(SubnameNode);
export const SUBNAME_NODE_DOMAIN = "SubnameNode"
export type SubnameNodeDocument = HydratedDocument<SubnameNode>