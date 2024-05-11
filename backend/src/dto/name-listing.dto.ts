import { Network } from 'src/types';
import { Address, Hash } from 'viem';

export class NameListing {
  name: string;
  namehash: Hash;
  price: number;
  network: Network;
  owner: Address;
}
