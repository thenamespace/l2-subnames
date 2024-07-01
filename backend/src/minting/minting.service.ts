import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config.service';
import { MintContext } from 'src/dto/mint-context.dto';
import { ListedNamesService } from 'src/listed-names/listed-names.service';
import { getContracts } from 'src/web3/contracts/contract-addresses';
import { NameRegistryService } from 'src/web3/contracts/name-registry.service';
import { getNetwork } from 'src/web3/utils';
import { Address, Hash, namehash, parseEther } from 'viem';
import { MintSigner } from './mint-signer';
import { MintRequest, Network } from 'src/dto/types';

@Injectable()
export class MintingService {

  constructor(
    private registry: NameRegistryService,
    private listings: ListedNamesService,
    private signer: MintSigner,
    private config: AppConfig,
  ) {
  
  }

  public async verifySubnameMint(
    request: MintRequest
  ): Promise<{ signature: Hash; parameters: MintContext }> {

    const { label, ensName, network, owner } = request;
    const subname = `${label}.${ensName}`;
    const taken = await this.registry.isSubnameTaken(network, subname);

    if (taken) {
      throw new BadRequestException(`Subname '${subname}' is already minted.`);
    }

    const listing = await this.listings.getNameListing(ensName);

    if (!listing) {
      throw new BadRequestException(`Listing for '${ensName}' does not exist.`);
    }

    const price = BigInt(parseEther(listing.price.toString())).toString();

    const parentLabel = listing.name.endsWith(".eth") ? listing.name.split(".")[0] : listing.name;

    const nameResolverAddr = getContracts(network).resolver;

    const parameters: MintContext = {
      label,
      parentLabel: parentLabel,
      resolver: nameResolverAddr,
      owner,
      price,
      fee: '0',
      expiry: Number.MAX_SAFE_INTEGER,
      paymentReceiver: listing.owner,
      resolverData: [],
    };

    const signature = await this.signer.sign(network, parameters);

    return { signature, parameters: parameters };
  }
}
