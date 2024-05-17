import { Address, Hash } from 'viem';

export class MintContext {
  label: string;
  parentNode: Hash;
  resolver: Address;
  owner: Address;
  price: string;
  fee: string;
  expiry: string;
  paymentReceiver: Address;
  resolverData: Hash[];
}
