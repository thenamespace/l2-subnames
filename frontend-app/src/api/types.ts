import { Address, Hash } from "viem";

export interface Listing {
    name: string;
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
    resolverData: Hash[]
}

export interface MintContextResponse {
    parameters: MintContext
    signature: string
}