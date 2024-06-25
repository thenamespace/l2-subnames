import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { NameRegistryService } from './contracts/name-registry.service';
import { RpcClient } from './rpc-client';
import { MetadataService, TempMetadataController } from './temp-metadata';

@Module({
  imports: [AppConfigModule],
  providers: [RpcClient, NameRegistryService, MetadataService],
  controllers: [TempMetadataController],
  exports: [RpcClient, NameRegistryService, MetadataService],
})
export class Web3Module {}
