import { Module } from '@nestjs/common';
import { StoreModule } from 'src/db/store.module';
import { Web3Module } from 'src/web3/web3.module';
import { ListedNamesService } from './listed-names.service';
import { ListingVerifier } from './listing-verifier';
import { ListingRegistration } from './listing-registration';
import { AppConfigModule } from 'src/config/config.module';

@Module({
  providers: [ListedNamesService, ListingVerifier, ListingRegistration],
  exports: [ListedNamesService],
  imports: [StoreModule, Web3Module, AppConfigModule],
})
export class ListedNamesModule {}
