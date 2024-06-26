import { Module, forwardRef } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { NameRegistryService } from './contracts/name-registry.service';
import { EnsRegistryService } from './ens-registry/ens-registry.service';
import { NameWrapperService } from './name-wrapper/name-wrapper.service';
import { RpcClient } from './rpc-client';
import { FactoryListener } from './listeners/registry-factory.listener';
import { ListedNamesModule } from 'src/listed-names/listed-names.module';
import { PermissionValidator } from './permission.validator';

@Module({
  imports: [AppConfigModule, forwardRef(() => ListedNamesModule)],
  providers: [
    RpcClient,
    NameRegistryService,
    NameWrapperService,
    EnsRegistryService,
    PermissionValidator,
    FactoryListener,
  ],
  exports: [RpcClient, NameRegistryService, PermissionValidator],
})
export class Web3Module {}
