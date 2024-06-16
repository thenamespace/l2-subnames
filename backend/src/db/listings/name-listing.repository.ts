import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NameListing as NameListingDto } from 'src/dto/name-listing.dto';
import { Network } from 'src/dto/types';
import {
  NAMELISTINGS_DOMAIN,
  NameListing,
  NameListingsDocument,
} from './name-listing.schema';

@Injectable()
export class NameListingRepository {
  @InjectModel(NAMELISTINGS_DOMAIN)
  private readonly repository: Model<NameListingsDocument>;

  async initListing(network: Network) {
    await this.repository.create({ network });
  }

  async setListing(
    network: Network,
    listing: NameListingDto,
    syncBlock?: bigint,
  ) {
    const setSyncBlock = syncBlock ? { syncBlock } : {};

    await this.repository.updateOne(
      {
        network,
        'listings.ensName': {
          $ne: listing.name,
        },
      },
      {
        $set: setSyncBlock,
        $addToSet: {
          listings: {
            owner: listing.owner,
            priceEth: listing.priceEth,
            paymentReceiver: listing.owner,
            ensName: listing.name,
            label: listing.label,
            listingName: listing.listingName,
            symbol: listing.symbol,
          },
        },
      },
    );
  }

  async getListings(network: Network): Promise<NameListing[]> {
    const result = await this.repository.findOne({ network });

    return result?.listings;
  }
}
