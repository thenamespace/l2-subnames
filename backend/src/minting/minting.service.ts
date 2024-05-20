import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import { MintContext } from 'src/dto/mint-context.dto';
import { ListedNamesService } from 'src/listed-names/listed-names.service';
import { getContracts } from 'src/web3/contracts/contract-addresses';
import { NameRegistryService } from 'src/web3/contracts/name-registry.service';
import { getNetwork } from 'src/web3/utils';
import { Address, Hash, namehash, parseEther } from 'viem';
import { MintSigner } from './mint-signer';

@Injectable()
export class MintingService {
  readonly resolver: Address;

  constructor(
    private registry: NameRegistryService,
    private listings: ListedNamesService,
    private signer: MintSigner,
    private config: AppConfig,
  ) {
    const network = getNetwork(this.config.l2Chain);
    this.resolver = getContracts(network).resolver;
  }

  public async verifySubnameMint(
    label: string,
    domain: string,
    owner: Address,
  ): Promise<{ signature: Hash; parameters: MintContext }> {
    const subname = `${label}.${domain}`;
    const taken = await this.registry.isSubnameTaken(subname);

    if (taken) {
      throw new BadRequestException(`Subname '${subname}' is already minted.`);
    }

    const listing = await this.listings.getNameListing(domain);

    if (!listing) {
      throw new BadRequestException(`Listing for '${domain}' does not exist.`);
    }

    const price = BigInt(parseEther(listing.price.toString())).toString();

    const parentLabel = listing.name.endsWith(".eth") ? listing.name.split(".")[0] : listing.name;

    const parameters: MintContext = {
      label,
      parentLabel: parentLabel,
      resolver: this.resolver,
      owner,
      price,
      fee: '0',
      expiry: Number.MAX_SAFE_INTEGER,
      paymentReceiver: listing.owner,
      resolverData: [],
    };

    const signature = await this.signer.sign(parameters);

    return { signature, parameters: parameters };
  }
}
