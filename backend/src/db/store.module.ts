import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NameListingRepository } from './listings/name-listing.repository';
import {
  NAMELISTINGS_DOMAIN,
  NameListingsSchema,
} from './listings/name-listing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        schema: NameListingsSchema,
        name: NAMELISTINGS_DOMAIN,
      },
    ]),
  ],
  providers: [NameListingRepository],
  exports: [NameListingRepository],
})
export class StoreModule {}
