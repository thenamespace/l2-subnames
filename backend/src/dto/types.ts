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
  network: Network
  resolverData?: Hash[]
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
