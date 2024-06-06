import { Injectable } from '@nestjs/common';
import { EnsRegistryService } from 'src/web3/ens-registry/ens-registry.service';
import { NameWrapperService } from 'src/web3/name-wrapper/name-wrapper.service';
import { Address } from 'viem';

@Injectable()
export class PermissionValidator {
  constructor(
    private nameWrapper: NameWrapperService,
    private ensRegistry: EnsRegistryService,
  ) {}

  async hasOwnerPermission(ensName: string, account: Address) {
    const hasPermission = await this.nameWrapper.canModifyName(
      ensName,
      account,
    );

    if (hasPermission) return true;

    const owner = (await this.ensRegistry.getOwner(ensName)) as Address;

    if (owner.toLocaleLowerCase() === account?.toLocaleLowerCase()) {
      return true;
    }

    return await this.ensRegistry.isApprovedForAll(owner, account);
  }
}
