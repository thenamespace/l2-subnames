import { Network } from 'src/dto/types';
import { Address, Hash } from 'viem';

export class NameListing {
  name: string;
  label: string;
  symbol: string;
  listingName: string;
  namehash: Hash;
  price: number;
  network: Network;
  owner: Address;
  paymentReceiver: Address;
}
