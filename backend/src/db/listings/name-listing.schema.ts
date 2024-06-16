import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Network } from 'src/dto/types';
import { Address } from 'viem';

@Schema({ _id: false })
export class NameListing {
  @Prop({ type: String, required: true })
  owner: Address;

  @Prop({ type: BigInt, required: false })
  priceEth: bigint;

  @Prop({ type: String, required: true })
  paymentReceiver: Address;

  @Prop({ type: String, required: true })
  ensName: string;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: true })
  listingName: string;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String })
  tokenAddress: Address;
}

@Schema({ collection: 'name-listings' })
export class NameListings {
  @Prop({ required: true, type: String })
  network: Network;

  @Prop({ type: BigInt })
  syncBlock: bigint;

  @Prop({ required: true, type: [NameListing], default: [] })
  listings: NameListing[];
}

export const NAMELISTINGS_DOMAIN = 'NameListings';
export const NameListingsSchema = SchemaFactory.createForClass(NameListings);
export type NameListingsDocument = mongoose.HydratedDocument<NameListings>;
