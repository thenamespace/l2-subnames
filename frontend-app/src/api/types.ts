import { Address, Hash } from "viem";
import { Web3Network } from "../web3";
import { NameListing } from "./listings-v2";

export interface Listing {
  name: string;
  network: Web3Network;
}

export interface ListingV2 {
  name: string;
  tokenNetwork: Web3Network;
}

export interface ListingOption {
  value: string;
  label: string;
}

export interface MintContext {
  label: string;
  parentLabel: string;
  resolver: Address;
  owner: Address;
  price: string;
  fee: string;
  expiry: string;
  paymentReceiver: Address;
  resolverData: Hash[];
}

export interface MintContextResponse {
  parameters: MintContext;
  signature: string;
}

export const L2Listings: NameListing[] = [
  {
    fullName: "musicaw3.eth",
    tokenNetwork: "base",
    label: "musicaw3",
    version: 1
  },
  {
    fullName: "gotbased.eth",
    tokenNetwork: "base",
    label: "gotbased",
    version: 1
  },
];
