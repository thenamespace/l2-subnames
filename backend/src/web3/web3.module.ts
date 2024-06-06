import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { NameRegistryService } from './contracts/name-registry.service';
import { NameWrapperService } from './name-wrapper/name-wrapper.service';
import { RpcClient } from './rpc-client';

@Module({
  imports: [AppConfigModule],
  providers: [RpcClient, NameRegistryService, NameWrapperService],
  exports: [RpcClient, NameRegistryService],
})
export class Web3Module {}
