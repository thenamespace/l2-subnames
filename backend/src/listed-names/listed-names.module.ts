import { Module } from '@nestjs/common';
import { StoreModule } from 'src/db/store.module';
import { Web3Module } from 'src/web3/web3.module';
import { ListedNamesService } from './listed-names.service';
import { ListingVerifier } from './listing-verifier';

@Module({
  providers: [ListedNamesService, ListingVerifier],
  exports: [ListedNamesService],
  imports: [StoreModule, Web3Module],
})
export class ListedNamesModule {}
