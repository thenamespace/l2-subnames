import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { Web3Module } from 'src/web3/web3.module';
import { MetadataService } from './metadata.service';

@Module({
  providers: [MetadataService],
  exports: [MetadataService],
  imports: [AppConfigModule, Web3Module],
})
export class MetadataModule {}
