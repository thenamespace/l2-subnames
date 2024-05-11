import { Injectable } from '@nestjs/common';
import { ListedNamesService } from 'src/listed-names/listed-names.service';
import { NameRegistryService } from 'src/web3/contracts/name-registry.service';

@Injectable()
export class MintingService {
  constructor(
    private registry: NameRegistryService,
    private listings: ListedNamesService,
    private minting: MintingService,
  ) {}

  public async mintSubname(label: string, domain: string) {
    const subname = `${label}.${domain}`;
    const taken = await this.registry.isSubnameTaken(subname);

    if (taken) {
      throw Error(`Subname '${subname}' is already minted.`);
    }

    const listing = await this.listings.getNameListing(domain);

    if (!listing) {
      throw Error(`Listing for '${domain}' does not exist.`);
    }
  }
}
