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

  async addListing(network: Network, listing: NameListingDto) {
    await this.repository.updateOne(
      {
        network,
        'listings.ensName': {
          $ne: listing.name,
        },
      },
      {
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

  async updateListing(
    network: Network,
    listing: Partial<NameListingDto>,
    syncBlock?: bigint,
  ) {
    await this.repository.updateOne(
      {
        network,
      },
      {
        $set: {
          syncBlock,
          'listings.$[elem].priceEth': listing.priceEth,
          'listings.$[elem].paymentReceiver': listing.paymentReceiver,
          'listings.$[elem].label': listing.label,
          'listings.$[elem].listingName': listing.listingName,
          'listings.$[elem].symbol': listing.symbol,
          'listings.$[elem].tokenAddress': listing.token,
        },
      },
      { arrayFilters: [{ 'elem.ensName': { $eq: listing.name } }] },
    );
  }

  async getListings(
    network: Network,
  ): Promise<{ listings: NameListing[]; block: bigint }> {
    const result = await this.repository.findOne({ network });

    return { listings: result?.listings, block: result?.syncBlock };
  }
}
