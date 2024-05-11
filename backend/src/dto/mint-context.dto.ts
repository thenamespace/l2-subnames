import { Address, Hash } from 'viem';

export class MintContext {
  label: string;
  parentNode: Hash;
  resolver: Address;
  owner: Address;
  price: bigint;
  fee: bigint;
  expiry: bigint;
  paymentReceiver: Address;
}
