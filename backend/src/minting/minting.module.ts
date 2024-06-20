import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { ListedNamesModule } from 'src/listed-names/listed-names.module';
import { Web3Module } from 'src/web3/web3.module';
import { MintSigner } from './mint-signer';
import { MintingService } from './minting.service';
import { SponsoredBaseMinter } from './sponsored-minter';
import { MailSender } from './mail-sender';

@Module({
  providers: [MintingService, MintSigner, SponsoredBaseMinter, MailSender],
  imports: [Web3Module, ListedNamesModule, AppConfigModule],
  exports: [SponsoredBaseMinter, MintingService, MailSender]
})
export class MintingModule {}
