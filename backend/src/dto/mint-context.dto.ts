import { Address, Hash } from 'viem';

export class MintContext {
  label: string;
  parentLabel: string;
  resolver: Address;
  owner: Address;
  price: string;
  fee: string;
  paymentReceiver: Address;
  resolverData: Hash[];
  expiry: number;
}
