import { Address, Hash } from 'viem';

export type Network =
  | 'sepolia'
  | 'base'
  | 'optimism'
  | 'arbitrum'
  | 'localhost';

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
}

export interface MintResponse {
  signature: string;
  parameters: {
    label: string;
    parentNode: Hash;
    owner: Address;
    resolver: Address;
    price: string;
    fee: string;
    paymentReceiver: Address;
  };
}
