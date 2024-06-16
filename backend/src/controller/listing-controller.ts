import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import { Network } from 'src/dto/types';
import { ListedNamesService } from 'src/listed-names/listed-names.service';
import { RegistryContext } from 'src/listed-names/listing-registration';
import { Address, Hash } from 'viem';

@Controller('/api/v0.1.0/listings')
export class ListingController {
  constructor(private listing: ListedNamesService) {}

  @Get('/:network')
  public async getListings(@Param('network') network: Network) {
    return this.listing.getListings(network);
  }

  @Get('/:network/:name')
  public async getListing(
    @Param('network') network: Network,
    @Param('name') name: string,
  ) {
    return this.listing.getNameListing(network, name);
  }

  @Get('/validate/:name')
  public async validateNameListing(
    @Param('name') name: string,
    @Query('lister') lister: Address,
  ): Promise<{ hasOwnerPermission: boolean }> {
    return await this.listing.validateNameListing(name, lister);
  }

  @Post('/:lister')
  public async addListing(
    @Param('lister') lister: Address,
    @Body() listing: NameListing,
    @Headers('Authorization') signature: Hash,
  ): Promise<{ context: RegistryContext; signature: Hash }> {
    return await this.listing.addListing(lister, signature, listing);
  }
}
