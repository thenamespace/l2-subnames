import { Injectable } from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import { Address, Hash, verifyTypedData } from 'viem';

type ListingContext = {
  name: string;
  price: bigint;
  paymentReceiver: Address;
};

@Injectable()
export class ListingVerifier {
  readonly types = {
    ListContext: [
      { name: 'name', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'paymentReceiver', type: 'address' },
    ],
  };

  async verify(
    lister: Address,
    signature: Hash,
    listing: NameListing,
    chainId: number,
  ): Promise<boolean> {
    const domain = {
      name: 'Namespace',
      version: '1',
      chainId,
    };

    const message: ListingContext = {
      name: listing.name,
      paymentReceiver: listing.paymentReceiver,
      price: listing.priceEth,
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
