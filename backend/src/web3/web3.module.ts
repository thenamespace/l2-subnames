import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { NameRegistryService } from './contracts/name-registry.service';
import { EnsRegistryService } from './ens-registry/ens-registry.service';
import { NameWrapperService } from './name-wrapper/name-wrapper.service';
import { PermissionValidator } from './permission.validator';
import { RpcClient } from './rpc-client';

@Module({
  imports: [AppConfigModule],
  providers: [
    RpcClient,
    NameRegistryService,
    NameWrapperService,
    EnsRegistryService,
    PermissionValidator,
  ],
  exports: [RpcClient, NameRegistryService, PermissionValidator],
})
export class Web3Module {}
