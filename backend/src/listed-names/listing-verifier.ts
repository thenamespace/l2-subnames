import { Injectable } from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import { RpcClient } from 'src/web3/rpc-client';
import { Address, Hash, verifyTypedData } from 'viem';

type ListingContext = {
  name: string;
  price: number;
  paymentReciever: Address;
};

@Injectable()
export class ListingVerifier {
  readonly types = {
    ListContext: [
      { name: 'owner', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'paymentReceiver', type: 'address' },
    ],
  };

  constructor(private rpcClient: RpcClient) {}

  async verify(
    lister: Address,
    signature: Hash,
    listing: NameListing,
  ): Promise<boolean> {
    const chainId = this.rpcClient.getChain(listing.network);

    const domain = {
      name: 'Namespace',
      version: '1',
      chainId,
    };

    const message: ListingContext = {
      name: listing.name,
      paymentReciever: listing.paymentReciever,
      price: listing.price,
    };

    return await verifyTypedData({
      address: lister,
      domain,
      types: this.types,
      primaryType: 'ListContext',
      message,
      signature,
    });
  }
}
