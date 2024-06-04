import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { ListedNamesModule } from 'src/listed-names/listed-names.module';
import { Web3Module } from 'src/web3/web3.module';
import { MintSigner } from './mint-signer';
import { MintingService } from './minting.service';
import { SponsoredBaseMinter } from './sponsored-minter';

@Module({
  providers: [MintingService, MintSigner, SponsoredBaseMinter],
  imports: [Web3Module, ListedNamesModule, AppConfigModule],
  exports: [SponsoredBaseMinter, MintingService]
})
export class MintingModule {}
