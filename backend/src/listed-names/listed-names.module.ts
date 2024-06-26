import { Module, forwardRef } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { StoreModule } from 'src/db/store.module';
import { ListedNamesService } from './listed-names.service';
import { ListingRegistration } from './listing-registration';
import { ListingVerifier } from './listing-verifier';
import { Web3Module } from 'src/web3/web3.module';

@Module({
  providers: [ListedNamesService, ListingVerifier, ListingRegistration],
  exports: [ListedNamesService],
  imports: [StoreModule, AppConfigModule, forwardRef(() => Web3Module)],
})
export class ListedNamesModule {}
