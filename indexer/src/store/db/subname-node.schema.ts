import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Network } from "src/web3/types";
import { Address, Hash } from "viem";

@Schema({ _id: false })
export class SubnameNode {
  @Prop({ required: true, type: String })
  label: string;

  @Prop({ required: true, type: String })
  parentNode: Hash;

  @Prop({ required: true, type: String })
  node: Hash;

  @Prop({ required: true, type: String })
  owner: Address;

  @Prop({ required: false, type: Object })
  addresses: Record<string, Address>;

  @Prop({ required: false, type: Object })
  texts: Record<string, string>;

  @Prop({ required: false, type: String })
  contentHash: Hash;

  @Prop({ required: true, type: Number })
  createdAt: number;

  @Prop({ required: true, type: Number })
  expiry: number;
}

@Schema({ collection: "subname-nodes" })
export class SubnameNodes {
  @Prop({ required: true, type: String })
  network: Network;

  @Prop({ type: BigInt })
  syncBlock: bigint;

  @Prop({ required: true, type: [SubnameNode] })
  subnames: SubnameNode[];
}

export const SubnameNodesSchema = SchemaFactory.createForClass(SubnameNodes);
SubnameNodesSchema.index({ "subnames.node": 1, network: 1 }, { unique: true });

export const SUBNAME_NODES_DOMAIN = "SubnameNodes";
export type SubnameNodeDocument = HydratedDocument<SubnameNodes>;
