import { Network } from 'src/dto/types';
import { Address, Hash } from 'viem';

export class NameListing {
  name: string;
  label: string;
  symbol: string;
  listingName: string;
  namehash: Hash;
  priceEth: bigint;
  network: Network;
  owner: Address;
  paymentReceiver: Address;
  token: Address;
}
