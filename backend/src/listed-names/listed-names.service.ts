import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { NameListingRepository } from 'src/db/listings/name-listing.repository';
import { NameListing } from 'src/dto/name-listing.dto';
import { Network } from 'src/dto/types';
import listings from 'src/listed-names/listings.json';
import { PermissionValidator } from 'src/web3/permission.validator';
import { Address, Hash } from 'viem';
import { ListingVerifier } from './listing-verifier';
import { RpcClient } from 'src/web3/rpc-client';
import { ListingRegistration, RegistryContext } from './listing-registration';
import { AppConfig } from 'src/config/app-config.service';

@Injectable()
export class ListedNamesService implements OnApplicationBootstrap {
  constructor(
    private nameListingRepo: NameListingRepository,
    private permissionValidator: PermissionValidator,
    private listingVerifier: ListingVerifier,
    private listingRegistration: ListingRegistration,
    private rpcClient: RpcClient,
    private appConfig: AppConfig,
  ) {}

  async onApplicationBootstrap() {
    try {
      this.initListingRepo('localhost');
      this.initListingRepo('sepolia');
    } catch (error) {
      console.log('Error initializing ListedNameService', error);
    }
  }

  private async initListingRepo(network: Network) {
    const listings = await this.nameListingRepo.getListings(network);

    if (!listings) {
      await this.nameListingRepo.initListing(network);
    }
  }

  public async validateNameListing(
    ensName: string,
    lister: Address,
  ): Promise<{ hasOwnerPermission: boolean }> {
    const hasOwnerPermission =
      await this.permissionValidator.hasOwnerPermission(ensName, lister);

    return { hasOwnerPermission: Boolean(hasOwnerPermission) };
  }

  public async addListing(
    lister: Address,
    listingSignature: Hash,
    listing: NameListing,
  ): Promise<{ context: RegistryContext; signature: Hash }> {
    const chainId = this.rpcClient.getChain(listing.network);

    const verified = await this.listingVerifier.verify(
      lister,
      listingSignature,
      listing,
      chainId.id,
    );

    if (!verified) {
      throw new Error('Signature validation failed.');
    }

    const permittedToList = await this.permissionValidator.hasOwnerPermission(
      listing.name,
      lister,
    );

    if (!permittedToList) {
      throw new Error('Not allowed to list.');
    }

    await this.nameListingRepo.setListing(listing.network, listing);

    const context: RegistryContext = {
      ensName: listing.label,
      listingName: listing.listingName,
      symbol: listing.symbol,
      baseUri: this.appConfig.metadataUrl.concat(`/${chainId.id}/`),
    };

    const signature = await this.listingRegistration.generateContext(
      context,
      listing.network,
      chainId.id,
    );

    return { context, signature };
  }

  public async getListings(): Promise<NameListing[]> {
    return listings as NameListing[];
  }

  public async getNameListing(ensName: string): Promise<NameListing> {
    const listing = listings.find((l) => l.name === ensName) as NameListing;
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }
}
