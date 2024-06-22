import { Address } from 'viem';

export type Network =
  | 'sepolia'
  | 'base'
  | 'optimism'
  | 'arbitrum'
  | 'localhost'
  | 'mainnet';

export interface ListedName {
  label: string;
  namehash: string;
  price: number;
  network: Network;
  owner: string;
}

export interface MintRequest {
  label: string;
  ensName: string;
  owner: Address;
  network: Network;
  expiry: number;
}

export interface MintResponse {
  signature: string;
  parameters: {
    label: string;
    parentLabel: string;
    owner: Address;
    resolver: Address;
    price: string;
    fee: string;
    paymentReceiver: Address;
  };
}

export enum ListingType {
  BASIC,
  EXPIRABLE,
}

export enum ParentControl {
  NO_CONTROL,
  CONTROLLABLE
}
